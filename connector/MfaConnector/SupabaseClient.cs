using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Mfa;

public enum SendResult { Ok, Retry, Rejected, AuthRequired }

/// <summary>
/// Cliente mínimo de Supabase (Auth + un único INSERT). Actúa SIEMPRE como el usuario autenticado
/// (JWT de su sesión): RLS se aplica íntegra. Solo lleva la clave pública (anon/publishable);
/// no existe ningún secreto de servidor en el conector.
/// </summary>
public sealed class SupabaseClient
{
    readonly HttpClient _http = new() { Timeout = TimeSpan.FromSeconds(15) };
    readonly Config _cfg;
    string? _access, _refresh; DateTime _exp = DateTime.MinValue;
    public string LastError { get; private set; } = "";

    public SupabaseClient(Config cfg) { _cfg = cfg; _refresh = Secret.Load(); }
    public bool HasSession => _refresh != null;

    static StringContent Json(string s) => new(s, Encoding.UTF8, "application/json");

    /// <summary>Inicio de sesión una sola vez (comando login). Devuelve la respuesta de Auth.</summary>
    public static async Task<AuthResponse> LoginAsync(string url, string anonKey, string email, string password)
    {
        using var http = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };
        using var req = new HttpRequestMessage(HttpMethod.Post, url.TrimEnd('/') + "/auth/v1/token?grant_type=password");
        req.Headers.Add("apikey", anonKey);
        req.Content = Json(JsonSerializer.Serialize(new PasswordGrant { Email = email, Password = password }, MfaJson.Default.PasswordGrant));
        using var resp = await http.SendAsync(req);
        string body = await resp.Content.ReadAsStringAsync();
        if (!resp.IsSuccessStatusCode) throw new InvalidOperationException($"Login rechazado ({(int)resp.StatusCode}).");
        var ar = JsonSerializer.Deserialize(body, MfaJson.Default.AuthResponse);
        if (ar?.User is null || ar.RefreshToken == "") throw new InvalidOperationException("Respuesta de login inesperada.");
        return ar;
    }

    async Task<SendResult> EnsureAccess(bool force, CancellationToken ct)
    {
        if (!force && _access != null && DateTime.UtcNow < _exp) return SendResult.Ok;
        if (_refresh == null) { LastError = "No hay sesión guardada. Ejecuta: MfaConnector login"; return SendResult.AuthRequired; }
        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, _cfg.SupabaseUrl.TrimEnd('/') + "/auth/v1/token?grant_type=refresh_token");
            req.Headers.Add("apikey", _cfg.AnonKey);
            req.Content = Json(JsonSerializer.Serialize(new RefreshGrant { RefreshToken = _refresh }, MfaJson.Default.RefreshGrant));
            using var resp = await _http.SendAsync(req, ct);
            string body = await resp.Content.ReadAsStringAsync(ct);
            if (resp.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
            { LastError = "La sesión expiró o fue revocada. Ejecuta: MfaConnector login"; _refresh = null; return SendResult.AuthRequired; }
            if (!resp.IsSuccessStatusCode) { LastError = $"Auth respondió {(int)resp.StatusCode}"; return SendResult.Retry; }
            var ar = JsonSerializer.Deserialize(body, MfaJson.Default.AuthResponse);
            if (ar?.User is null) { LastError = "Respuesta de Auth inesperada"; return SendResult.Retry; }
            if (ar.User.Id != _cfg.UserId) { LastError = "La sesión pertenece a otro usuario."; _refresh = null; return SendResult.AuthRequired; }
            _access = ar.AccessToken; _refresh = ar.RefreshToken;
            _exp = DateTime.UtcNow.AddSeconds(Math.Max(60, ar.ExpiresIn - 60));
            Secret.Save(_refresh);                  // Supabase rota el refresh token en cada uso
            return SendResult.Ok;
        }
        catch (Exception e) when (e is HttpRequestException or TaskCanceledException or IOException)
        {
            if (ct.IsCancellationRequested) throw;
            LastError = "Sin conexión con Supabase (" + e.GetType().Name + ")"; return SendResult.Retry;
        }
    }

    /// <summary>INSERT idempotente: ON CONFLICT (user_id, session_uuid) DO NOTHING.
    /// Reenviar el mismo vuelo nunca crea duplicados.</summary>
    public async Task<SendResult> InsertFlightAsync(string json, CancellationToken ct)
    {
        for (int attempt = 0; attempt < 2; attempt++)
        {
            var a = await EnsureAccess(force: attempt == 1, ct);
            if (a != SendResult.Ok) return a;
            try
            {
                using var req = new HttpRequestMessage(HttpMethod.Post, _cfg.SupabaseUrl.TrimEnd('/') + "/rest/v1/flights?on_conflict=user_id,session_uuid");
                req.Headers.Add("apikey", _cfg.AnonKey);
                req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _access);
                req.Headers.Add("Prefer", "resolution=ignore-duplicates,return=minimal");
                req.Content = Json(json);
                using var resp = await _http.SendAsync(req, ct);
                if (resp.IsSuccessStatusCode) return SendResult.Ok;
                string body = await resp.Content.ReadAsStringAsync(ct);
                int code = (int)resp.StatusCode;
                if (code == 401 && attempt == 0) continue;              // JWT caducado: refrescar y reintentar una vez
                if (code == 401) { LastError = "No autorizado (401)."; return SendResult.AuthRequired; }
                if (code is 408 or 429 or >= 500) { LastError = $"Servidor respondió {code}"; return SendResult.Retry; }
                LastError = $"Rechazado {code}: " + (body.Length > 300 ? body[..300] : body);
                return SendResult.Rejected;
            }
            catch (Exception e) when (e is HttpRequestException or TaskCanceledException or IOException)
            {
                if (ct.IsCancellationRequested) throw;
                LastError = "Sin conexión con Supabase (" + e.GetType().Name + ")"; return SendResult.Retry;
            }
        }
        return SendResult.Retry;
    }
}