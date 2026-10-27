namespace Mfa;

/// <summary>Vuelo sintético SKBG→SKBO para probar tracker, cola y sincronización SIN MSFS.
/// Las marcas de tiempo son sintéticas (no se espera en tiempo real).</summary>
public static class Simulation
{
    public sealed class Resolver : IAirportResolver
    {
        static readonly (string Icao, double Lat, double Lon)[] Table =
            { ("SKBG", 7.1265, -73.1848), ("SKBO", 4.7016, -74.1469) };
        public void FindNearest(double lat, double lon, Action<string?, double> done)
        {
            string? best = null; double bd = double.MaxValue;
            foreach (var a in Table) { double d = Geo.Nm(lat, lon, a.Lat, a.Lon); if (d < bd) { bd = d; best = a.Icao; } }
            done(best, bd);
        }
    }

    public static IEnumerable<Sample> Flight(DateTime t0, bool withPause)
    {
        const double aLat = 7.1265, aLon = -73.1848, bLat = 4.7016, bLon = -74.1469;
        DateTime t = t0; double zulu = 40000;
        const string title = "SIMULATED Test Aircraft";
        Sample Mk(double lat, double lon, double alt, bool gnd, double gs, double td) =>
            new(t, title, lat, lon, alt, gnd ? 0 : alt - 3000, gnd, gs, zulu, td, 1.0);
        void Tick(bool advanceZulu = true) { t = t.AddSeconds(1); if (advanceZulu) zulu += 1; }

        for (int i = 0; i < 30; i++) { yield return Mk(aLat, aLon, 3200, true, 0, 0); Tick(); }          // parado
        for (int i = 0; i < 40; i++) { yield return Mk(aLat, aLon, 3200, true, i * 3.5, 0); Tick(); }    // carrera
        const int N = 2400;
        for (int i = 0; i < N; i++)                                                                       // vuelo
        {
            double f = (double)i / N;
            double alt = i < 600 ? 3200 + (20000 - 3200) * i / 600.0 : i < N - 600 ? 20000 : 20000 - (20000 - 8400) * (i - (N - 600)) / 600.0;
            yield return Mk(aLat + (bLat - aLat) * f, aLon + (bLon - aLon) * f, alt, false, 250, 0);
            Tick();
            if (withPause && i == 1000) for (int k = 0; k < 30; k++) { yield return Mk(aLat + (bLat - aLat) * f, aLon + (bLon - aLon) * f, alt, false, 250, 0); Tick(false); }
        }
        yield return Mk(bLat, bLon, 8400, true, 130, 2.1); Tick();                                        // toque (2,1 ft/s ≈ 126 fpm)
        for (int i = 0; i < 25; i++) { yield return Mk(bLat, bLon, 8400, true, Math.Max(3, 130 - i * 6), 2.1); Tick(); }
        for (int i = 0; i < 40; i++) { yield return Mk(bLat, bLon, 8400, true, 3, 2.1); Tick(); }        // parado
    }
}