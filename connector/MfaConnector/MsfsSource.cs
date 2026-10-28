#if HAS_SIMCONNECT
// Fuente real de datos: SimConnect (SDK de MSFS 2024, API administrada).
// Requiere compilar contra el SDK de MSFS 2024 (no el de 2020: cambia la longitud de ident).
using System.Diagnostics;
using System.Runtime.InteropServices;
using Microsoft.FlightSimulator.SimConnect;

namespace Mfa;

public sealed class MsfsSource : IAirportResolver
{
    enum Def { Telemetry }
    enum Req { Telemetry, Airports }

    // El orden de los campos DEBE coincidir con el orden de AddToDataDefinition.
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi, Pack = 1)]
    struct Telemetry
    {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)] public string Title;
        public double Lat, Lon, AltMsl, AltAgl;
        public int OnGround;
        public double Gs, Zulu, TdFps, SimRate;
    }

    const string ProcessName = "FlightSimulator2024";

    readonly Action<string> _log;
    readonly EventWaitHandle _ev = new(false, EventResetMode.AutoReset);
    SimConnect? _sc; bool _quit;
    (double Lat, double Lon, Action<string?, double> Done, string? Best, double BestD)? _pend;

    public FlightTracker? Tracker { get; set; }
    public MsfsSource(Action<string> log) { _log = log; }

    static bool SimRunning()
    {
        var ps = Process.GetProcessesByName(ProcessName);
        bool r = ps.Length > 0;
        foreach (var p in ps) p.Dispose();
        return r;
    }

    /// <summary>Bucle principal (bloqueante). Espera a MSFS, conecta, procesa y reconecta si se cierra.</summary>
    public void Run(CancellationToken ct)
    {
        bool waitingLogged = false;
        while (!ct.IsCancellationRequested)
        {
            if (!SimRunning())
            {
                if (!waitingLogged) { _log("Esperando a MSFS 2024..."); waitingLogged = true; }
                ct.WaitHandle.WaitOne(15000); continue;
            }
            waitingLogged = false;
            try { Session(ct); }
            catch (COMException e) { _log("SimConnect no disponible todavía: " + e.Message); }
            catch (Exception e) when (e is DllNotFoundException or BadImageFormatException or FileNotFoundException)
            { _log("Falta SimConnect.dll o Microsoft.FlightSimulator.SimConnect.dll junto al ejecutable (x64): " + e.Message); ct.WaitHandle.WaitOne(60000); }
            Tracker?.OnSimClosed();
            ct.WaitHandle.WaitOne(5000);
        }
    }

    void Session(CancellationToken ct)
    {
        _quit = false; _pend = null;
        // Sin ventana: SimConnect avisa mediante un EventWaitHandle (hilo dormido = 0 % CPU).
        _sc = new SimConnect("My Flight Academy", IntPtr.Zero, 0, _ev, 0);
        try
        {
            _sc.OnRecvOpen += OnOpen;
            _sc.OnRecvQuit += (s, d) => { _log("MSFS se cerró."); _quit = true; };
            _sc.OnRecvException += (s, d) => _log("SimConnect excepción: " + (SIMCONNECT_EXCEPTION)d.dwException);
            _sc.OnRecvSimobjectData += OnData;
            _sc.OnRecvAirportList += OnAirports;

            while (!_quit && !ct.IsCancellationRequested)
            {
                if (_ev.WaitOne(5000)) Pump();
                else if (!SimRunning()) { _log("MSFS ya no está en ejecución."); break; }
            }
        }
        finally { _sc.Dispose(); _sc = null; _pend = null; }
    }

    // La lista de aeropuertos llega en ráfagas de paquetes: se vacía la cola completa en cada aviso.
    void Pump()
    {
        for (int i = 0; i < 4096 && !_quit; i++)
        {
            try { _sc!.ReceiveMessage(); }
            catch (COMException) { break; }   // cola vacía
        }
    }

    void OnOpen(SimConnect s, SIMCONNECT_RECV_OPEN d)
    {
        string ver = $"{d.dwApplicationVersionMajor}.{d.dwApplicationVersionMinor}.{d.dwApplicationBuildMajor}.{d.dwApplicationBuildMinor}";
        if (Tracker != null) Tracker.SimVersion = ver;
        _log($"Conectado a {d.szApplicationName} {ver}.");

        uint i = 0;
        void Add(string name, string? unit, SIMCONNECT_DATATYPE t) =>
            s.AddToDataDefinition(Def.Telemetry, name, unit, t, 0.0f, i++);
        Add("TITLE", null, SIMCONNECT_DATATYPE.STRING256);
        Add("PLANE LATITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64);
        Add("PLANE LONGITUDE", "degrees", SIMCONNECT_DATATYPE.FLOAT64);
        Add("PLANE ALTITUDE", "feet", SIMCONNECT_DATATYPE.FLOAT64);
        Add("PLANE ALT ABOVE GROUND", "feet", SIMCONNECT_DATATYPE.FLOAT64);
        Add("SIM ON GROUND", "bool", SIMCONNECT_DATATYPE.INT32);
        Add("GROUND VELOCITY", "knots", SIMCONNECT_DATATYPE.FLOAT64);
        Add("ZULU TIME", "seconds", SIMCONNECT_DATATYPE.FLOAT64);
        Add("PLANE TOUCHDOWN NORMAL VELOCITY", "feet per second", SIMCONNECT_DATATYPE.FLOAT64);
        Add("SIMULATION RATE", "number", SIMCONNECT_DATATYPE.FLOAT64);
        s.RegisterDataDefineStruct<Telemetry>(Def.Telemetry);

        s.RequestDataOnSimObject(Req.Telemetry, Def.Telemetry, SimConnect.SIMCONNECT_OBJECT_ID_USER,
            SIMCONNECT_PERIOD.SECOND, SIMCONNECT_DATA_REQUEST_FLAG.DEFAULT, 0, 0, 0);
    }

    void OnData(SimConnect s, SIMCONNECT_RECV_SIMOBJECT_DATA d)
    {
        if (d.dwRequestID != (uint)Req.Telemetry || d.dwData == null || d.dwData.Length == 0) return;
        try
        {
            var t = (Telemetry)d.dwData[0];
            Tracker?.OnSample(new Sample(DateTime.UtcNow, t.Title ?? "", t.Lat, t.Lon, t.AltMsl, t.AltAgl,
                t.OnGround != 0, t.Gs, t.Zulu, t.TdFps, t.SimRate));
        }
        catch (Exception e) { _log("Error procesando muestra: " + e.Message); }   // nunca tumbar el conector
    }

    // ── Aeropuerto más cercano (solo se consulta 2 veces por vuelo: despegue y toque) ──────────
    public void FindNearest(double lat, double lon, Action<string?, double> done)
    {
        if (_sc == null || _pend != null) { done(null, 0); return; }
        _pend = (lat, lon, done, null, double.MaxValue);
        try { _sc.RequestFacilitiesList(SIMCONNECT_FACILITY_LIST_TYPE.AIRPORT, Req.Airports); }
        catch (COMException) { var p = _pend; _pend = null; p?.Done(null, 0); }
    }

    void OnAirports(SimConnect s, SIMCONNECT_RECV_AIRPORT_LIST d)
    {
        if (_pend is not { } p) return;
        string? best = p.Best; double bestD = p.BestD;
        foreach (object o in d.rgData)
        {
            var a = (SIMCONNECT_DATA_FACILITY_AIRPORT)o;
            double dist = Geo.Nm(p.Lat, p.Lon, a.Latitude, a.Longitude);
            if (dist < bestD) { bestD = dist; best = a.Ident; }
        }
        if (d.dwEntryNumber >= d.dwOutOf - 1) { _pend = null; p.Done(best, bestD); }   // último paquete
        else _pend = (p.Lat, p.Lon, p.Done, best, bestD);
    }
}
#endif