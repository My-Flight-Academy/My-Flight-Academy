using System.Text;
using System.Text.Json;

namespace Mfa;

public static class Program
{
    public const string Version = "0.1.0";

    static void Log(string m) => Console.WriteLine($"{DateTime.Now:HH:mm:ss} {m}");

    public static async Task<int> Main(string[] args)
    {
        string cmd = args.Length > 0 ? args[0].ToLowerInvariant() : "help";
        try
        {
            return cmd switch
            {
                "login" => await Login(),
                "logout" => Logout(),
                "run" => await Run(),
                "simulate" => await Simulate(args.Skip(1).ToArray()),
                "status" => Status(),
                _ => Help(),
            };
        }
        catch (Exception e) { Console.Error.WriteLine("Error: " + e.Message); return 1; }
    }

    static int Help()
    {
        Console.WriteLine($"""
            My Flight Academy - conector MSFS 2024 v{Version}
              login                  Inicia sesión (una vez). Guarda solo el refresh token, cifrado con DPAPI.
              run                    Conecta con MSFS 2024, detecta vuelos y los sincroniza.
              simulate [--send] [--pause]
                                     Vuelo sintético SIN MSFS. Sin --send solo muestra el registro (no escribe en Supabase).
              status                 Estado de sesión, cola y compilación.
              logout                 Borra la sesión local.
            """);
        return 0;
    }

    // ── login / logout / status ───────────────────────────────────────────────────────────
    static async Task<int> Login()
    {
        var old = ConfigStore.Load();
        string url = Environment.GetEnvironmentVariable("MFA_SUPABASE_URL") ?? Ask("URL del proyecto Supabase (https://xxxx.supabase.co): ", old?.SupabaseUrl);
        string anon = Environment.GetEnvironmentVariable("MFA_SUPABASE_ANON_KEY") ?? Ask("Clave pública (anon/publishable, NUNCA la service_role): ", old?.AnonKey);
        if (!Uri.TryCreate(url, UriKind.Absolute, out var u) || (u.Scheme != "https" && !u.IsLoopback))
            throw new InvalidOperationException("La URL debe ser https://... (http solo para localhost).");
        if (anon.StartsWith("sb_secret_", StringComparison.Ordinal))
            throw new InvalidOperationException("Eso es una clave secreta. Usa solo la clave pública (anon/publishable).");
        string email = Ask("Email: ", old?.Email);
        string pass = ReadSecret("Contraseña: ");

        var ar = await SupabaseClient.LoginAsync(url, anon, email, pass);
        ConfigStore.Save(new Config { SupabaseUrl = url.TrimEnd('/'), AnonKey = anon, UserId = ar.User!.Id, Email = email });
        Secret.Save(ar.RefreshToken);
        Console.WriteLine($"Sesión iniciada. user_id = {ar.User.Id}");
        Console.WriteLine("La contraseña no se guarda; solo el refresh token cifrado.");
        return 0;
    }

    static int Logout() { Secret.Delete(); Console.WriteLine("Sesión local borrada. La cola pendiente (outbox) se conserva."); return 0; }

    static int Status()
    {
        var cfg = ConfigStore.Load();
        Console.WriteLine($"Carpeta de datos : {Paths.Home}");
        Console.WriteLine($"Proyecto         : {(cfg is null ? "(sin configurar: ejecuta login)" : cfg.SupabaseUrl)}");
        Console.WriteLine($"Usuario          : {(cfg is null ? "-" : cfg.Email + " / " + cfg.UserId)}");
        Console.WriteLine($"Sesión guardada  : {(Secret.Load() != null ? "sí" : "no")}");
        Directory.CreateDirectory(Paths.OutboxDir);
        Console.WriteLine($"Vuelos en cola   : {Directory.GetFiles(Paths.OutboxDir, "*.json").Length}");
        string rej = Path.Combine(Paths.OutboxDir, "rejected");
        Console.WriteLine($"Vuelos rechazados: {(Directory.Exists(rej) ? Directory.GetFiles(rej, "*.json").Length : 0)}");
#if HAS_SIMCONNECT
        Console.WriteLine("SimConnect       : compilado CON SDK de MSFS 2024");
#else
        Console.WriteLine("SimConnect       : compilado SIN SDK (solo 'simulate')");
#endif
        return 0;
    }

    // ── run ───────────────────────────────────────────────────────────────────────────────
    static async Task<int> Run()
    {
        var cfg = ConfigStore.Load();
        if (cfg is null) { Console.Error.WriteLine("Primero ejecuta: MfaConnector login"); return 2; }
        var client = new SupabaseClient(cfg);
        if (!client.HasSession) Log("AVISO: no hay sesión. Los vuelos se guardarán en cola hasta que ejecutes 'login'.");
        var outbox = new Outbox(client, Log);

        using var cts = new CancellationTokenSource();
        Console.CancelKeyPress += (_, e) => { e.Cancel = true; cts.Cancel(); };
        var sync = outbox.RunAsync(cts.Token);

#if HAS_SIMCONNECT
        var src = new MsfsSource(Log);
        var tracker = new FlightTracker(src, Log);
        src.Tracker = tracker;
        tracker.Completed += f =>
        {
            try { outbox.Enqueue(FlightRow.From(f, cfg.UserId)); }
            catch (Exception e) { Log("No se pudo guardar el vuelo en la cola local: " + e.Message); }
        };
        Log("Conector activo. Ctrl+C para salir.");
        await Task.Run(() => src.Run(cts.Token));
#else
        Console.Error.WriteLine("Este ejecutable se compiló SIN el SDK de MSFS 2024 (variable MSFS2024_SDK). Ver docs/connector.md.");
        cts.Cancel();
#endif
        await sync;
        return 0;
    }

    // ── simulate ──────────────────────────────────────────────────────────────────────────
    static async Task<int> Simulate(string[] opts)
    {
        bool send = opts.Contains("--send"), pause = opts.Contains("--pause");
        var cfg = ConfigStore.Load();
        if (send && cfg is null) { Console.Error.WriteLine("--send requiere haber ejecutado login."); return 2; }

        FlightRow? row = null;
        var tracker = new FlightTracker(new Simulation.Resolver(), Log) { SimVersion = "SIMULATED" };
        tracker.Completed += f =>
        {
            row = FlightRow.From(f, cfg?.UserId ?? Guid.Empty);
            Console.WriteLine(JsonSerializer.Serialize(row, MfaJson.Default.FlightRow));
        };
        var t0 = DateTime.UtcNow.AddHours(-2);
        int n = 0;
        foreach (var s in Simulation.Flight(t0, pause)) { tracker.OnSample(s); n++; }
        Log($"{n} muestras procesadas.");
        if (row is null) { Console.Error.WriteLine("No se generó ningún vuelo."); return 3; }
        if (!send) { Log("Dry-run: no se escribió nada. Usa --send para encolar y sincronizar."); return 0; }

        var client = new SupabaseClient(cfg!);
        var outbox = new Outbox(client, Log);
        outbox.Enqueue(row);
        using var cts = new CancellationTokenSource();
        var sync = outbox.RunAsync(cts.Token);
        for (int i = 0; i < 90 && outbox.Pending > 0; i++) await Task.Delay(1000);
        cts.Cancel(); await sync;
        Log(outbox.Pending == 0 ? $"Cola vacía. Rechazados: {outbox.Rejected}." : $"Quedan {outbox.Pending} en cola (se reintentará con 'run').");
        return 0;
    }

    // ── utilidades de consola ─────────────────────────────────────────────────────────────
    static string Ask(string prompt, string? def)
    {
        Console.Write(def is { Length: > 0 } ? $"{prompt}[{def}] " : prompt);
        string s = (Console.ReadLine() ?? "").Trim();
        return s.Length > 0 ? s : def ?? "";
    }

    static string ReadSecret(string prompt)
    {
        Console.Write(prompt);
        if (Console.IsInputRedirected) return Console.ReadLine() ?? "";
        var sb = new StringBuilder(); ConsoleKeyInfo k;
        while ((k = Console.ReadKey(true)).Key != ConsoleKey.Enter)
        {
            if (k.Key == ConsoleKey.Backspace) { if (sb.Length > 0) sb.Length--; }
            else if (!char.IsControl(k.KeyChar)) sb.Append(k.KeyChar);
        }
        Console.WriteLine();
        return sb.ToString();
    }
}