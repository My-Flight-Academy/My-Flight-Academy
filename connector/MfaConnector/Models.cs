using System.Text.Json.Serialization;

namespace Mfa;

/// <summary>Una lectura de telemetría (1 por segundo). Nada de esto se envía a Supabase.</summary>
public readonly record struct Sample(
    DateTime Utc, string Title, double Lat, double Lon,
    double AltMslFt, double AltAglFt, bool OnGround, double GsKt,
    double Zulu, double TdFps, double SimRate);

/// <summary>Resumen de un vuelo terminado, ya calculado localmente.</summary>
public sealed record FinishedFlight(
    Guid SessionUuid, DateTime StartedUtc, DateTime EndedUtc, bool Completed,
    string? Aircraft, string? DepIcao, double? DepDistNm, string? ArrIcao, double? ArrDistNm,
    double DistanceNm, int MaxAltFt, int? LandingVsFpm,
    int PausedSeconds, double MaxSimRate, int PositionJumps, int Touchdowns, string? SimVersion);

public sealed class ConnectorMeta
{
    [JsonPropertyName("v")] public int V { get; set; } = 1;
    [JsonPropertyName("connector")] public string Connector { get; set; } = Program.Version;
    [JsonPropertyName("sim_version")] public string? SimVersion { get; set; }
    /// <summary>Campos que el conector NO pudo detectar de forma fiable (quedan en NULL).</summary>
    [JsonPropertyName("undetected")] public string[] Undetected { get; set; } = Array.Empty<string>();
    [JsonPropertyName("dep_dist_nm")] public double? DepDistNm { get; set; }
    [JsonPropertyName("arr_dist_nm")] public double? ArrDistNm { get; set; }
    [JsonPropertyName("paused_s")] public int PausedS { get; set; }
    [JsonPropertyName("max_sim_rate")] public double MaxSimRate { get; set; }
    [JsonPropertyName("position_jumps")] public int PositionJumps { get; set; }
    [JsonPropertyName("touchdowns")] public int Touchdowns { get; set; }
}

/// <summary>Cuerpo exacto del INSERT en public.flights. NO incluye verification_status
/// (lo fija la BD a 'unverified'; RLS lo exige).</summary>
public sealed class FlightRow
{
    [JsonPropertyName("user_id")] public Guid UserId { get; set; }
    [JsonPropertyName("session_uuid")] public Guid SessionUuid { get; set; }
    [JsonPropertyName("dep_icao")] public string? DepIcao { get; set; }
    [JsonPropertyName("arr_icao")] public string? ArrIcao { get; set; }
    [JsonPropertyName("aircraft")] public string? Aircraft { get; set; }
    [JsonPropertyName("started_at")] public DateTime StartedAt { get; set; }
    [JsonPropertyName("ended_at")] public DateTime EndedAt { get; set; }
    [JsonPropertyName("duration_seconds")] public int DurationSeconds { get; set; }
    [JsonPropertyName("distance_nm")] public double? DistanceNm { get; set; }
    [JsonPropertyName("max_altitude_ft")] public int MaxAltitudeFt { get; set; }
    [JsonPropertyName("landing_vs_fpm")] public int? LandingVsFpm { get; set; }
    [JsonPropertyName("flight_status")] public string FlightStatus { get; set; } = "completed";
    [JsonPropertyName("simulator")] public string Simulator { get; set; } = "Microsoft Flight Simulator 2024";
    [JsonPropertyName("source")] public string Source { get; set; } = "connector";
    [JsonPropertyName("connector_meta")] public ConnectorMeta? ConnectorMeta { get; set; }

    public static FlightRow From(FinishedFlight f, Guid userId)
    {
        var und = new List<string> { "alt_icao" };   // SimConnect no expone el alternativo
        if (f.DepIcao is null) und.Add("dep_icao");
        if (f.ArrIcao is null) und.Add("arr_icao");
        if (f.LandingVsFpm is null) und.Add("landing_vs_fpm");
        if (f.DistanceNm <= 0) und.Add("distance_nm");
        return new FlightRow
        {
            UserId = userId, SessionUuid = f.SessionUuid,
            DepIcao = f.DepIcao, ArrIcao = f.ArrIcao, Aircraft = f.Aircraft,
            StartedAt = DateTime.SpecifyKind(f.StartedUtc, DateTimeKind.Utc),
            EndedAt = DateTime.SpecifyKind(f.EndedUtc, DateTimeKind.Utc),
            DurationSeconds = (int)Math.Round((f.EndedUtc - f.StartedUtc).TotalSeconds),
            DistanceNm = f.DistanceNm > 0 ? Math.Round(f.DistanceNm, 2) : null,
            MaxAltitudeFt = f.MaxAltFt, LandingVsFpm = f.LandingVsFpm,
            FlightStatus = f.Completed ? "completed" : "interrupted",
            ConnectorMeta = new ConnectorMeta
            {
                SimVersion = f.SimVersion, Undetected = und.ToArray(),
                DepDistNm = f.DepDistNm is double a ? Math.Round(a, 1) : null,
                ArrDistNm = f.ArrDistNm is double b ? Math.Round(b, 1) : null,
                PausedS = f.PausedSeconds, MaxSimRate = Math.Round(f.MaxSimRate, 2),
                PositionJumps = f.PositionJumps, Touchdowns = f.Touchdowns,
            },
        };
    }
}

public sealed class Config
{
    [JsonPropertyName("supabaseUrl")] public string SupabaseUrl { get; set; } = "";
    [JsonPropertyName("anonKey")] public string AnonKey { get; set; } = "";   // clave pública (publishable/anon)
    [JsonPropertyName("userId")] public Guid UserId { get; set; }
    [JsonPropertyName("email")] public string Email { get; set; } = "";
}

public sealed class AuthUser { [JsonPropertyName("id")] public Guid Id { get; set; } }
public sealed class AuthResponse
{
    [JsonPropertyName("access_token")] public string AccessToken { get; set; } = "";
    [JsonPropertyName("refresh_token")] public string RefreshToken { get; set; } = "";
    [JsonPropertyName("expires_in")] public int ExpiresIn { get; set; }
    [JsonPropertyName("user")] public AuthUser? User { get; set; }
}
public sealed class PasswordGrant
{
    [JsonPropertyName("email")] public string Email { get; set; } = "";
    [JsonPropertyName("password")] public string Password { get; set; } = "";
}
public sealed class RefreshGrant { [JsonPropertyName("refresh_token")] public string RefreshToken { get; set; } = ""; }

[JsonSourceGenerationOptions(DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
[JsonSerializable(typeof(FlightRow))]
[JsonSerializable(typeof(Config))]
[JsonSerializable(typeof(AuthResponse))]
[JsonSerializable(typeof(PasswordGrant))]
[JsonSerializable(typeof(RefreshGrant))]
internal partial class MfaJson : JsonSerializerContext { }

public static class Geo
{
    /// <summary>Distancia ortodrómica en millas náuticas.</summary>
    public static double Nm(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 3440.065, D = Math.PI / 180;
        double dLat = (lat2 - lat1) * D, dLon = (lon2 - lon1) * D;
        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                   Math.Cos(lat1 * D) * Math.Cos(lat2 * D) * Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        return 2 * R * Math.Asin(Math.Min(1, Math.Sqrt(a)));
    }
}