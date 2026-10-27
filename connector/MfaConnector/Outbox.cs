using System.Text.Json;

namespace Mfa;

/// <summary>
/// Cola local en disco (1 archivo JSON por vuelo). Garantías:
///  - el vuelo se guarda en disco ANTES de intentar enviarlo (sobrevive a cortes de Internet y reinicios);
///  - el archivo se borra solo tras confirmación del servidor;
///  - reintentos con espera exponencial (30 s → 15 min); con la cola vacía no hay temporizadores ni red;
///  - errores permanentes (RLS/CHECK) van a outbox/rejected con el motivo, sin reintentar eternamente;
///  - session_uuid fijo por vuelo + ON CONFLICT DO NOTHING = sin duplicados aunque se reenvíe.
/// </summary>
public sealed class Outbox
{
    readonly SupabaseClient _c; readonly Action<string> _log;
    readonly string _dir = Paths.OutboxDir, _rej;
    readonly SemaphoreSlim _wake = new(0);

    public Outbox(SupabaseClient c, Action<string> log)
    {
        _c = c; _log = log; _rej = Path.Combine(_dir, "rejected");
        Directory.CreateDirectory(_rej);
    }

    public int Pending => Directory.GetFiles(_dir, "*.json").Length;
    public int Rejected => Directory.GetFiles(_rej, "*.json").Length;

    public string Enqueue(FlightRow row)
    {
        string name = $"{row.StartedAt:yyyyMMddHHmmss}_{row.SessionUuid:N}.json";
        string path = Path.Combine(_dir, name), tmp = path + ".tmp";
        File.WriteAllText(tmp, JsonSerializer.Serialize(row, MfaJson.Default.FlightRow));
        File.Move(tmp, path, overwrite: true);
        _wake.Release();
        return path;
    }

    public async Task RunAsync(CancellationToken ct)
    {
        var backoff = TimeSpan.FromSeconds(30);
        var wait = TimeSpan.Zero;                       // primera pasada al arrancar (por si quedó algo pendiente)
        while (!ct.IsCancellationRequested)
        {
            try { await _wake.WaitAsync(wait, ct); } catch (OperationCanceledException) { break; }
            while (_wake.CurrentCount > 0) _wake.Wait(0);

            SendResult r;
            try { r = await DrainAsync(ct); } catch (OperationCanceledException) { break; }

            if (r == SendResult.Ok) { wait = Timeout.InfiniteTimeSpan; backoff = TimeSpan.FromSeconds(30); }
            else if (r == SendResult.Retry)
            {
                _log($"Envío pendiente ({_c.LastError}). Reintento en {backoff.TotalSeconds:F0} s.");
                wait = backoff; backoff = TimeSpan.FromSeconds(Math.Min(backoff.TotalSeconds * 2, 900));
            }
            else { _log("Envío en pausa: " + _c.LastError); wait = TimeSpan.FromMinutes(30); }
        }
    }

    async Task<SendResult> DrainAsync(CancellationToken ct)
    {
        foreach (var file in Directory.GetFiles(_dir, "*.json").OrderBy(f => f, StringComparer.Ordinal))
        {
            string json = await File.ReadAllTextAsync(file, ct);
            var r = await _c.InsertFlightAsync(json, ct);
            string name = Path.GetFileName(file);
            switch (r)
            {
                case SendResult.Ok: File.Delete(file); _log($"Vuelo sincronizado ({name})."); break;
                case SendResult.Rejected:
                    File.Move(file, Path.Combine(_rej, name), overwrite: true);
                    File.WriteAllText(Path.Combine(_rej, name + ".err.txt"), _c.LastError);
                    _log($"Vuelo rechazado por el servidor, movido a rejected/: {_c.LastError}");
                    break;
                default: return r;                      // Retry o AuthRequired: se detiene y conserva la cola
            }
        }
        return SendResult.Ok;
    }
}