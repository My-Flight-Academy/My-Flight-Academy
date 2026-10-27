namespace Mfa;

public interface IAirportResolver
{
    /// <summary>Busca el aeropuerto más cercano. Llama a <paramref name="done"/> (icao, distancia nm);
    /// icao = null si no se pudo resolver. Puede tardar; el llamador no debe bloquearse.</summary>
    void FindNearest(double lat, double lon, Action<string?, double> done);
}

/// <summary>
/// Máquina de estados del vuelo. Un vuelo = despegue -> último toque. Procesa 1 muestra/s,
/// guarda solo acumuladores (sin historial) y no hace I/O. Un solo hilo.
/// </summary>
public sealed class FlightTracker
{
    // Umbrales (documentados en docs/connector.md)
    const double TakeoffGsKt = 30, StopGsKt = 30, MaxPlausibleKt = 1500, MaxAirportNm = 5;
    const int TakeoffConfirm = 3, StopConfirmSec = 20, MinFlightSec = 60, MinInterruptedSec = 300;

    enum Ph { Idle, Airborne, Landed }

    sealed class F
    {
        public Guid Id = Guid.NewGuid();
        public DateTime Start, Landing; public bool HasLanding;
        public string Title = "";
        public string? Dep, Arr; public double? DepD, ArrD;
        public double Dist, MaxAlt, PausedS, StopS, MaxRate = 1, TdAtAir;
        public double? TdFps; public int Jumps, Td;
    }

    readonly IAirportResolver _air; readonly Action<string> _log;
    Ph _ph = Ph.Idle; F? _f; Sample? _prev, _lastGround, _firstAir; int _airN;

    public event Action<FinishedFlight>? Completed;
    public string? SimVersion { get; set; }
    public string State => _ph.ToString();

    public FlightTracker(IAirportResolver air, Action<string> log) { _air = air; _log = log; }

    public void OnSample(in Sample s)
    {
        double dt = 0;
        if (_prev is Sample p)
        {
            dt = (s.Utc - p.Utc).TotalSeconds;
            if (dt <= 0) return;
            double d = Geo.Nm(p.Lat, p.Lon, s.Lat, s.Lon);
            if (d > 2 && d / (dt / 3600.0) > MaxPlausibleKt)
            {
                _log($"Salto de posición ({d:F0} nm en {dt:F0} s): se corta el seguimiento.");
                if (_f != null) { _f.Jumps++; Finish(p, _ph == Ph.Landed); }
                _ph = Ph.Idle; _lastGround = null; _airN = 0; _prev = null;
            }
        }

        switch (_ph)
        {
            case Ph.Idle: Idle(s); break;
            default: InFlight(s, dt); break;
        }
        _prev = s;
    }

    void Idle(in Sample s)
    {
        if (s.OnGround) { _lastGround = s; _airN = 0; return; }
        // Solo se cuenta como despegue si antes se vio al avión en tierra (no vuelos que empiezan en el aire).
        if (_lastGround is Sample g && s.GsKt > TakeoffGsKt)
        {
            if (_airN++ == 0) _firstAir = s;
            if (_airN >= TakeoffConfirm) Start(g, _firstAir ?? s, s);
        }
        else _airN = 0;
    }

    void Start(Sample ground, Sample first, Sample now)
    {
        var f = new F { Start = first.Utc, Title = first.Title, TdAtAir = now.TdFps, MaxAlt = Math.Max(first.AltMslFt, now.AltMslFt) };
        _f = f; _ph = Ph.Airborne; _airN = 0;
        _log($"Despegue detectado ({f.Title}).");
        _air.FindNearest(ground.Lat, ground.Lon, (icao, d) => { f.DepD = d; f.Dep = Accept(icao, d); });
    }

    void InFlight(in Sample s, double dt)
    {
        var f = _f!; var p = _prev!.Value;
        f.Dist += Geo.Nm(p.Lat, p.Lon, s.Lat, s.Lon);
        f.MaxAlt = Math.Max(f.MaxAlt, s.AltMslFt);
        f.MaxRate = Math.Max(f.MaxRate, s.SimRate);
        bool paused = s.Zulu == p.Zulu;            // el reloj del simulador no avanza
        if (paused) f.PausedS += dt;

        if (_ph == Ph.Airborne)
        {
            if (!s.OnGround) { f.TdAtAir = s.TdFps; return; }
            // Toque: el valor latcheado de TOUCHDOWN NORMAL VELOCITY solo es fiable si cambió desde el aire.
            f.Td++; f.Landing = s.Utc; f.HasLanding = true;
            f.TdFps = (Math.Abs(s.TdFps - f.TdAtAir) > 1e-6 && Math.Abs(s.TdFps) >= 0.1) ? s.TdFps : null;
            _ph = Ph.Landed; f.StopS = 0; f.Arr = null; f.ArrD = null;
            _log("Toque de pista detectado.");
            _air.FindNearest(s.Lat, s.Lon, (icao, d) => { f.ArrD = d; f.Arr = Accept(icao, d); });
            return;
        }

        // Landed
        if (!s.OnGround) { _ph = Ph.Airborne; f.TdAtAir = s.TdFps; return; }   // rebote / touch-and-go
        if (s.GsKt < StopGsKt) { if (!paused) f.StopS += Math.Min(dt, 5); } else f.StopS = 0;
        if (f.StopS >= StopConfirmSec) Finish(s, completed: true);
    }

    /// <summary>MSFS se cerró o se perdió la conexión: cierra el vuelo en curso, si lo hay.</summary>
    public void OnSimClosed()
    {
        if (_f != null && _prev is Sample p) Finish(p, _ph == Ph.Landed);
        _ph = Ph.Idle; _prev = null; _lastGround = null; _airN = 0;
    }

    void Finish(Sample last, bool completed)
    {
        var f = _f!; _f = null; _ph = Ph.Idle; _airN = 0;
        _lastGround = last.OnGround ? last : null;
        DateTime end = completed && f.HasLanding ? f.Landing : last.Utc;
        double dur = (end - f.Start).TotalSeconds;
        string estado = completed ? "completado" : "interrumpido";
        if (dur > 86400) { _log("Vuelo descartado: dura más de 24 h."); return; }
        if (dur < (completed ? MinFlightSec : MinInterruptedSec))
        { _log($"Vuelo {estado} descartado: duración {dur:F0} s demasiado corta."); return; }

        int? vs = null;
        if (completed && f.TdFps is double v) vs = -(int)Math.Min(6000, Math.Round(Math.Abs(v) * 60));
        string? ac = string.IsNullOrWhiteSpace(f.Title) ? null : (f.Title.Length > 80 ? f.Title[..80] : f.Title.Trim());
        var fin = new FinishedFlight(f.Id, f.Start, end, completed, ac,
            f.Dep, f.DepD, completed ? f.Arr : null, completed ? f.ArrD : null,
            f.Dist, (int)Math.Clamp(Math.Round(f.MaxAlt), -2000, 100000), vs,
            (int)Math.Round(f.PausedS), f.MaxRate, f.Jumps, f.Td, SimVersion);
        _log($"Vuelo {estado}: {dur / 60:F0} min, {f.Dist:F0} nm.");
        Completed?.Invoke(fin);
    }

    static string? Accept(string? icao, double distNm)
    {
        if (icao is not { Length: 4 } || distNm > MaxAirportNm) return null;
        foreach (char c in icao) if (!((c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9'))) return null;
        return icao;
    }
}