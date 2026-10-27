using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

namespace Mfa;

public static class Paths
{
    public static string Home { get; } = Resolve();
    static string Resolve()
    {
        var h = Environment.GetEnvironmentVariable("MFA_HOME");
        if (string.IsNullOrWhiteSpace(h))
            h = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "MyFlightAcademy");
        Directory.CreateDirectory(h);
        return h;
    }
    public static string ConfigFile => Path.Combine(Home, "connector.json");
    public static string TokenFile => Path.Combine(Home, "session.bin");
    public static string OutboxDir => Path.Combine(Home, "outbox");
}

public static class ConfigStore
{
    public static Config? Load()
    {
        try { return File.Exists(Paths.ConfigFile) ? JsonSerializer.Deserialize(File.ReadAllText(Paths.ConfigFile), MfaJson.Default.Config) : null; }
        catch { return null; }
    }
    public static void Save(Config c) =>
        File.WriteAllText(Paths.ConfigFile, JsonSerializer.Serialize(c, MfaJson.Default.Config));
}

/// <summary>
/// Guarda SOLO el refresh token de la sesión del usuario (nunca la contraseña).
/// Windows: cifrado con DPAPI (solo el mismo usuario de Windows en este equipo puede descifrarlo).
/// Otros SO (solo pruebas): archivo con permisos 600, sin cifrar.
/// </summary>
public static class Secret
{
    [StructLayout(LayoutKind.Sequential)] struct Blob { public int cb; public IntPtr pb; }
    [DllImport("crypt32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    static extern bool CryptProtectData(ref Blob i, string? d, IntPtr e, IntPtr r, IntPtr p, int f, out Blob o);
    [DllImport("crypt32.dll", SetLastError = true)]
    static extern bool CryptUnprotectData(ref Blob i, IntPtr d, IntPtr e, IntPtr r, IntPtr p, int f, out Blob o);
    [DllImport("kernel32.dll")] static extern IntPtr LocalFree(IntPtr h);

    static byte[] Dpapi(byte[] data, bool protect)
    {
        var inp = new Blob { cb = data.Length, pb = Marshal.AllocHGlobal(data.Length) };
        try
        {
            Marshal.Copy(data, 0, inp.pb, data.Length);
            const int UiForbidden = 1;
            bool ok = protect ? CryptProtectData(ref inp, null, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, UiForbidden, out var o1)
                              : CryptUnprotectData(ref inp, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, UiForbidden, out o1);
            if (!ok) throw new InvalidOperationException("DPAPI falló (código " + Marshal.GetLastWin32Error() + ").");
            var res = new byte[o1.cb];
            Marshal.Copy(o1.pb, res, 0, o1.cb);
            LocalFree(o1.pb);
            return res;
        }
        finally { Marshal.FreeHGlobal(inp.pb); }
    }

    public static void Save(string refreshToken)
    {
        var raw = Encoding.UTF8.GetBytes(refreshToken);
        var tmp = Paths.TokenFile + ".tmp";
        File.WriteAllBytes(tmp, OperatingSystem.IsWindows() ? Dpapi(raw, true) : raw);
        if (!OperatingSystem.IsWindows()) File.SetUnixFileMode(tmp, UnixFileMode.UserRead | UnixFileMode.UserWrite);
        File.Move(tmp, Paths.TokenFile, overwrite: true);
    }

    public static string? Load()
    {
        try
        {
            if (!File.Exists(Paths.TokenFile)) return null;
            var b = File.ReadAllBytes(Paths.TokenFile);
            return Encoding.UTF8.GetString(OperatingSystem.IsWindows() ? Dpapi(b, false) : b);
        }
        catch { return null; }
    }

    public static void Delete() { try { File.Delete(Paths.TokenFile); } catch { } }
}