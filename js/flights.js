// My Flight Academy - Fase 3: Vuelos en la nube y rankings
// JS clasico (sin modulos ES). Se carga despues de profile.js.
// Define V.flights (CRUD de vuelos propios) y V.rank (rankings).
// Usa el cliente de Supabase creado por auth.js (window._sbClient). Solo anon key.

(function () {
  'use strict';

  var SIMS = ['Microsoft Flight Simulator 2024', 'Microsoft Flight Simulator 2020', 'X-Plane 12', 'Prepar3D', 'Otro'];
  var COLS = 'id,dep_icao,arr_icao,aircraft,simulator,started_at,ended_at,duration_seconds,landing_vs_fpm,flight_status,verification_status,notes,created_at';
  var MAX_ROWS = 500;
  var VSTAT = {
    unverified:     ['Sin verificar', ''],
    pending_review: ['En revisión', 'fl-am'],
    verified:       ['Verificado', 'fl-gr'],
    rejected:       ['Rechazado', 'fl-rd']
  };
  var FSTAT = { planned: 'Planeado', active: 'En curso', completed: 'Completado', interrupted: 'Interrumpido', cancelled: 'Cancelado' };

  // ── Estado ────────────────────────────────────────────────────────────────
  var syncUid = null;
  var FL = { rows: null, loading: false, err: '', editing: null, busy: false, note: null };
  var RK = { kind: 'hours', data: { hours: null, perf: null }, loading: false, err: '' };

  // ── Helpers ───────────────────────────────────────────────────────────────
  function E(v)  { return esc(v == null ? '' : v); }
  function q(id) { return document.getElementById(id); }
  function val(id) { var el = q(id); return el ? String(el.value).trim() : ''; }
  function client() { return window._sbClient || null; }
  function curUid() { var s = window._authSession; return s && s.user ? s.user.id : null; }
  function rerender() { if (typeof render === 'function') render(); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function fmtDur(sec) {
    if (sec == null) return '\u2014';
    var h = Math.floor(sec / 3600), m = Math.round((sec % 3600) / 60);
    if (m === 60) { h++; m = 0; }
    return h + ' h ' + pad(m) + ' min';
  }
  function fmtDate(iso) {
    if (!iso) return '\u2014';
    var d = new Date(iso);
    if (isNaN(d)) return '\u2014';
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' +
           pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function toLocalInput(iso) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d)) return '';
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function sortRows(rows) {
    rows.sort(function (a, b) {
      return new Date(b.started_at || b.created_at) - new Date(a.started_at || a.created_at);
    });
  }

  function dbErr(e) {
    var m = (e && e.message) || '';
    if (/violates check constraint|duration|chk_flights/i.test(m))
      return 'Algún dato no cumple las reglas de la base de datos (revisa fecha, duración y códigos ICAO).';
    if (/row-level security|permission denied/i.test(m) && !/Solo los vuelos/.test(m))
      return 'No tienes permiso para realizar esta operación.';
    if (/simulator/i.test(m) && /does not exist|schema cache/i.test(m))
      return 'Falta aplicar la migración 002 en Supabase (columna simulator).';
    if (/Could not find the function|ranking_/i.test(m))
      return 'El ranking no está disponible: falta aplicar la migración 002 en Supabase.';
    return typeof traducirError === 'function' ? traducirError(m) : (m || 'Error desconocido.');
  }

  function needLogin(title) {
    return '<h1>' + title + '</h1>' +
      '<p class="sub">Necesitas iniciar sesión para usar esta sección.</p>' +
      '<button class="btn" onclick="go(\'auth\')">Ir a Mi cuenta</button>';
  }

  // Reinicia el estado cuando cambia el usuario (login, logout, otra cuenta).
  function sync() {
    var u = curUid();
    if (syncUid === u) return;
    syncUid = u;
    FL = { rows: null, loading: false, err: '', editing: null, busy: false, note: null };
    RK.data = { hours: null, perf: null }; RK.loading = false; RK.err = '';
  }

  // ── Carga de vuelos propios ───────────────────────────────────────────────
  async function flLoad() {
    var sb = client(), u = curUid();
    if (!sb || !u || FL.loading) return;
    FL.loading = true; FL.err = '';
    var r = await sb.from('flights').select(COLS).eq('user_id', u)
      .order('started_at', { ascending: false, nullsFirst: false }).limit(MAX_ROWS);
    if (curUid() !== u) return;           // la sesion cambio mientras cargaba
    FL.loading = false;
    if (r.error) FL.err = dbErr(r.error); else FL.rows = r.data || [];
    rerender();
  }

  // ── Acciones (globales para los onclick) ──────────────────────────────────
  window.flReload = function () { FL.rows = null; FL.err = ''; FL.note = null; rerender(); };
  window.flNew    = function () { FL.editing = 'new'; FL.note = null; rerender(); setTimeout(function () { var el = q('fl_dep'); if (el) el.focus(); }, 60); };
  window.flEdit   = function (id) { FL.editing = id; FL.note = null; rerender(); setTimeout(function () { var el = q('fl_dep'); if (el) el.focus(); }, 60); };
  window.flCancel = function () { FL.editing = null; rerender(); };
  window.flToggleNote = function (id) { FL.openNote = FL.openNote === id ? null : id; rerender(); };

  window.flSave = async function () {
    if (FL.busy) return;
    var sb = client(), u = curUid();
    var errEl = q('fl_err');
    function fail(msg) { if (errEl) { errEl.textContent = msg; errEl.className = 'au-err'; } }
    if (!sb || !u) { fail('No hay sesión activa.'); return; }
    fail('');

    var dep = val('fl_dep').toUpperCase(), arr = val('fl_arr').toUpperCase();
    var ac = val('fl_ac'), sim = val('fl_sim'), startV = val('fl_start');
    var hStr = val('fl_h'), mStr = val('fl_m'), vsStr = val('fl_vs'), notes = val('fl_notes');

    if (!/^[A-Z0-9]{4}$/.test(dep)) { fail('El origen debe ser un código ICAO de 4 caracteres (ej. SKBG).'); return; }
    if (!/^[A-Z0-9]{4}$/.test(arr)) { fail('El destino debe ser un código ICAO de 4 caracteres (ej. SKBO).'); return; }
    if (!ac || ac.length > 80)      { fail('Indica la aeronave (máximo 80 caracteres).'); return; }
    if (SIMS.indexOf(sim) === -1)   { fail('Selecciona el simulador.'); return; }
    if (!startV)                    { fail('Indica la fecha y hora de salida.'); return; }
    var start = new Date(startV);
    if (isNaN(start))               { fail('La fecha de salida no es válida.'); return; }

    var hn = hStr === '' ? 0 : Number(hStr), mn = mStr === '' ? 0 : Number(mStr);
    if (!isFinite(hn) || !isFinite(mn) || hn % 1 !== 0 || mn % 1 !== 0 || hn < 0 || hn > 24 || mn < 0 || mn > 59) {
      fail('La duración debe ser en horas (0-24) y minutos (0-59) enteros.'); return;
    }
    var secs = hn * 3600 + mn * 60;
    if (secs < 60 || secs > 86400)  { fail('La duración debe estar entre 1 minuto y 24 horas.'); return; }
    var end = new Date(start.getTime() + secs * 1000);
    if (end.getTime() > Date.now() + 5 * 60000) { fail('Este formulario registra vuelos ya terminados: la hora de salida más la duración no puede superar la hora actual. Ajusta la salida o la duración.'); return; }

    var vs = null;
    if (vsStr !== '') {
      vs = Number(vsStr);
      if (!isFinite(vs) || vs % 1 !== 0 || Math.abs(vs) > 6000) { fail('La velocidad vertical de aterrizaje debe ser un entero entre -6000 y 6000 ft/min.'); return; }
    }
    if (notes.length > 1000)        { fail('Las notas no pueden superar los 1000 caracteres.'); return; }

    var fields = {
      dep_icao: dep, arr_icao: arr, aircraft: ac, simulator: sim,
      started_at: start.toISOString(), ended_at: end.toISOString(), duration_seconds: secs,
      landing_vs_fpm: vs, flight_status: 'completed', notes: notes || null
    };

    FL.busy = true;
    var form = q('fl_form'); if (form) form.classList.add('au-loading');
    var r, isNew = FL.editing === 'new';
    if (isNew) {
      fields.user_id = u;   // RLS exige auth.uid() = user_id; verification_status usa el valor por defecto
      r = await sb.from('flights').insert(fields).select(COLS).single();
    } else {
      r = await sb.from('flights').update(fields).eq('id', FL.editing).select(COLS).single();
    }
    FL.busy = false;
    if (form) form.classList.remove('au-loading');
    if (curUid() !== u) return;
    if (r.error) { fail(dbErr(r.error)); return; }

    if (isNew) FL.rows.push(r.data);
    else FL.rows = FL.rows.map(function (x) { return x.id === r.data.id ? r.data : x; });
    sortRows(FL.rows);
    FL.editing = null;
    FL.note = { t: isNew ? 'Vuelo registrado.' : 'Vuelo actualizado.', k: 'ok' };
    rerender();
  };

  window.flDelete = async function (id) {
    var sb = client(), u = curUid();
    if (!sb || !u) return;
    if (!confirm('¿Eliminar este vuelo? Esta acción no se puede deshacer.')) return;
    var r = await sb.from('flights').delete().eq('id', id).select('id');
    if (curUid() !== u) return;
    if (r.error)                          FL.note = { t: dbErr(r.error), k: 'err' };
    else if (!r.data || !r.data.length)   FL.note = { t: 'No se pudo eliminar el vuelo.', k: 'err' };
    else {
      FL.rows = FL.rows.filter(function (x) { return x.id !== id; });
      if (FL.editing === id) FL.editing = null;
      FL.note = { t: 'Vuelo eliminado.', k: 'ok' };
    }
    rerender();
  };

  // ── Vista: Vuelos en la nube ──────────────────────────────────────────────
  function flForm(row) {
    var isNew = !row;
    var r = row || {};
    var dur = r.duration_seconds != null ? r.duration_seconds : 0;
    var h = isNew ? '' : Math.floor(dur / 3600), m = isNew ? '' : Math.round((dur % 3600) / 60);
    var now = new Date();
    var maxLocal = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate()) + 'T' + pad(now.getHours()) + ':' + pad(now.getMinutes());
    var simOpts = '<option value="">Selecciona\u2026</option>' + SIMS.map(function (s) {
      return '<option value="' + E(s) + '"' + (r.simulator === s ? ' selected' : '') + '>' + E(s) + '</option>';
    }).join('');
    var up = 'oninput="this.value=this.value.toUpperCase().replace(/[^A-Z0-9]/g,\'\')"';

    return '<div class="card" id="fl_form" style="margin-bottom:18px">' +
      '<h2 style="margin-top:0">' + (isNew ? 'Registrar vuelo' : 'Editar vuelo') + '</h2>' +
      '<div class="fl-grid">' +
        '<div class="au-field"><label for="fl_dep">Origen (ICAO)</label>' +
          '<input id="fl_dep" type="text" maxlength="4" placeholder="SKBG" value="' + E(r.dep_icao) + '" autocomplete="off" spellcheck="false" ' + up + '></div>' +
        '<div class="au-field"><label for="fl_arr">Destino (ICAO)</label>' +
          '<input id="fl_arr" type="text" maxlength="4" placeholder="SKBO" value="' + E(r.arr_icao) + '" autocomplete="off" spellcheck="false" ' + up + '></div>' +
        '<div class="au-field"><label for="fl_ac">Aeronave</label>' +
          '<input id="fl_ac" type="text" maxlength="80" placeholder="Cessna 172" value="' + E(r.aircraft) + '"></div>' +
        '<div class="au-field"><label for="fl_sim">Simulador</label><select id="fl_sim">' + simOpts + '</select></div>' +
        '<div class="au-field"><label for="fl_start">Fecha y hora de salida</label>' +
          '<input id="fl_start" type="datetime-local" max="' + maxLocal + '" value="' + E(toLocalInput(r.started_at)) + '"></div>' +
        '<div class="au-field"><label for="fl_h">Duración</label>' +
          '<div class="fl-dur"><input id="fl_h" type="number" min="0" max="24" step="1" inputmode="numeric" placeholder="0" value="' + E(h) + '"><span>h</span>' +
          '<input id="fl_m" type="number" min="0" max="59" step="1" inputmode="numeric" placeholder="0" value="' + E(m) + '"><span>min</span></div></div>' +
        '<div class="au-field"><label for="fl_vs">Velocidad vertical al aterrizar (opcional)</label>' +
          '<input id="fl_vs" type="number" step="1" min="-6000" max="6000" placeholder="-150" value="' + E(r.landing_vs_fpm) + '">' +
          '<div class="au-hint">En ft/min. Solo cuenta para el ranking de rendimiento si el vuelo llega a verificarse.</div></div>' +
        '<div class="au-field fl-full"><label for="fl_notes">Notas (opcional)</label>' +
          '<textarea id="fl_notes" rows="3" maxlength="1000">' + E(r.notes) + '</textarea></div>' +
      '</div>' +
      '<div id="fl_err" class="au-err" role="alert"></div>' +
      '<div class="row" style="margin-top:14px">' +
        '<button class="btn" onclick="flSave()">' + (isNew ? 'Guardar vuelo' : 'Guardar cambios') + '</button>' +
        '<button class="btn g" onclick="flCancel()">Cancelar</button>' +
      '</div>' +
    '</div>';
  }

  V.flights = function () {
    sync();
    if (!curUid()) return needLogin('Vuelos en la nube');
    var head = '<h1>Vuelos en la nube</h1>' +
      '<p class="sub">Tu bitácora guardada en tu cuenta. Es independiente del Diario de vuelo local.</p>';

    if (FL.rows === null) {
      if (FL.err) {
        return head + '<div class="card" style="max-width:560px"><p class="au-err">' + E(FL.err) + '</p>' +
          '<button class="btn" onclick="flReload()">Reintentar</button></div>';
      }
      return head + '<div class="card" style="max-width:560px"><p style="color:var(--mu)">Cargando vuelos\u2026</p></div>';
    }

    var rows = FL.rows, total = rows.length, sec = 0, vsec = 0;
    rows.forEach(function (r) {
      if (r.flight_status === 'completed' && r.duration_seconds) {
        sec += r.duration_seconds;
        if (r.verification_status === 'verified') vsec += r.duration_seconds;
      }
    });

    var editingRow = null;
    if (FL.editing && FL.editing !== 'new') {
      rows.forEach(function (r) { if (r.id === FL.editing) editingRow = r; });
      if (!editingRow) FL.editing = null;
    }

    var html = head +
      '<div class="grid" style="margin-bottom:18px">' +
        '<div class="card"><div class="cap">VUELOS REGISTRADOS</div><div class="big">' + total + '</div></div>' +
        '<div class="card"><div class="cap">HORAS TOTALES</div><div class="big">' + E(fmtDur(sec)) + '</div></div>' +
        '<div class="card"><div class="cap">HORAS VERIFICADAS</div><div class="big">' + E(fmtDur(vsec)) + '</div>' +
          '<div class="au-hint">Solo estas horas cuentan en los rankings.</div></div>' +
      '</div>';

    if (FL.note) html += '<div class="' + (FL.note.k === 'ok' ? 'au-ok' : 'au-err') + '" role="status" style="margin:0 0 12px">' + E(FL.note.t) + '</div>';

    if (FL.editing) html += flForm(editingRow);
    else html += '<div class="row" style="margin-bottom:14px"><button class="btn" onclick="flNew()">Registrar vuelo</button></div>';

    if (!total) {
      html += '<div class="card"><p style="margin:0;color:var(--mu)">Aún no has registrado vuelos. Usa «Registrar vuelo» para añadir el primero.</p></div>';
    } else {
      html += '<div class="card wrap"><table><thead><tr><th>Fecha</th><th>Ruta</th><th>Aeronave</th><th>Simulador</th><th>Duración</th><th>Estado</th><th></th></tr></thead><tbody>' +
        rows.map(function (r) {
          var vs = VSTAT[r.verification_status] || [r.verification_status, ''];
          var locked = r.verification_status !== 'unverified';
          var hasNote = r.notes && String(r.notes).trim();
          var noteOpen = hasNote && FL.openNote === r.id;
          var fs = r.flight_status && r.flight_status !== 'completed' ? '<div class="au-hint">' + E(FSTAT[r.flight_status] || r.flight_status) + '</div>' : '';
          return '<tr>' +
            '<td class="mono">' + E(fmtDate(r.started_at || r.created_at)) + '</td>' +
            '<td class="mono">' + E(r.dep_icao || '\u2014') + ' \u2192 ' + E(r.arr_icao || '\u2014') + fs + '</td>' +
            '<td>' + E(r.aircraft || '\u2014') + '</td>' +
            '<td>' + E(r.simulator || '\u2014') + '</td>' +
            '<td class="mono">' + E(fmtDur(r.duration_seconds)) + '</td>' +
            '<td><span class="tag ' + vs[1] + '">' + E(vs[0]) + '</span></td>' +
            '<td><div class="fl-act">' +
              (hasNote ? '<button class="btn g" onclick="flToggleNote(\'' + E(r.id) + '\')">' + (noteOpen ? 'Ocultar notas' : 'Ver notas') + '</button>' : '') +
              (locked ? '' : '<button class="btn g" onclick="flEdit(\'' + E(r.id) + '\')">Editar</button>') +
              '<button class="btn g" onclick="flDelete(\'' + E(r.id) + '\')">Eliminar</button>' +
            '</div></td></tr>' +
            (noteOpen ? '<tr class="fl-notes"><td colspan="7"><div class="cap">NOTAS</div>' + E(r.notes) + '</td></tr>' : '');
        }).join('') + '</tbody></table></div>';
    }

    html += '<div class="note">Los vuelos que registras aquí quedan <b>sin verificar</b>. La verificación la realiza el sistema, no el usuario, ' +
      'y solo los vuelos verificados cuentan en los rankings. Un vuelo verificado ya no se puede editar, solo eliminar.</div>';
    return html;
  };

  // ── Rankings ──────────────────────────────────────────────────────────────
  async function rkLoad() {
    var sb = client(), u = curUid();
    if (!sb || !u || RK.loading) return;
    var kind = RK.kind;
    RK.loading = true; RK.err = '';
    var r = await sb.rpc(kind === 'hours' ? 'ranking_hours' : 'ranking_performance', { p_limit: 50 });
    if (curUid() !== u) return;
    RK.loading = false;
    if (r.error) RK.err = dbErr(r.error); else RK.data[kind] = r.data || [];
    rerender();
  }

  window.rkTab    = function (k) { RK.kind = k; RK.err = ''; rerender(); };
  window.rkReload = function () { RK.data[RK.kind] = null; RK.err = ''; rerender(); };

  V.rank = function () {
    sync();
    if (!curUid()) return needLogin('Rankings');
    var kind = RK.kind, rows = RK.data[kind];
    var head = '<h1>Rankings</h1><p class="sub">Clasificación de pilotos con perfil público. Solo cuentan vuelos verificados.</p>' +
      '<div class="au-tabs" role="tablist">' +
        '<button class="au-tab' + (kind === 'hours' ? ' on' : '') + '" role="tab" aria-selected="' + (kind === 'hours') + '" onclick="rkTab(\'hours\')">Horas totales</button>' +
        '<button class="au-tab' + (kind === 'perf' ? ' on' : '') + '" role="tab" aria-selected="' + (kind === 'perf') + '" onclick="rkTab(\'perf\')">Rendimiento</button>' +
      '</div>';

    var body;
    if (rows === null) {
      body = RK.err
        ? '<div class="card"><p class="au-err">' + E(RK.err) + '</p><button class="btn" onclick="rkReload()">Reintentar</button></div>'
        : '<div class="card"><p style="color:var(--mu)">Cargando ranking\u2026</p></div>';
    } else if (!rows.length) {
      body = '<div class="card"><p style="margin:0;color:var(--mu)">' + (kind === 'hours'
        ? 'Aún no hay vuelos verificados en el ranking.'
        : 'Aún no hay pilotos con al menos 3 aterrizajes verificados.') + '</p></div>';
    } else {
      var me = window._authProfile ? window._authProfile.username : null;
      var th = kind === 'hours'
        ? '<th>#</th><th>Piloto</th><th>Vuelos</th><th>Horas</th>'
        : '<th>#</th><th>Piloto</th><th>Aterrizajes</th><th>VS medio (ft/min)</th><th>Puntuación</th>';
      body = '<div class="card wrap"><table><thead><tr>' + th + '</tr></thead><tbody>' + rows.map(function (r) {
        var who = '<b>' + E(r.username) + '</b>' + (r.country ? ' <span class="tag">' + E(r.country) + '</span>' : '');
        var cells = kind === 'hours'
          ? '<td class="mono">' + E(r.flights_count) + '</td><td class="mono">' + E(fmtDur(Number(r.total_seconds))) + '</td>'
          : '<td class="mono">' + E(r.landings_count) + '</td><td class="mono">' + E(r.avg_landing_fpm) + '</td><td class="mono">' + E(r.performance_score) + '</td>';
        return '<tr' + (me && r.username === me ? ' class="fl-me"' : '') + '><td class="fl-pos">' + E(r.rank_pos) + '</td><td>' + who + '</td>' + cells + '</tr>';
      }).join('') + '</tbody></table></div>';
    }

    var priv = window._authProfile && window._authProfile.profile_visibility === 'private'
      ? '<div class="note">Tu perfil es privado: no apareces en los rankings. Puedes cambiarlo en Perfil.</div>' : '';

    var rules = kind === 'hours'
      ? '<b>Horas totales:</b> suma de la duración de tus vuelos completados y verificados. Desempata el mayor número de vuelos y, después, el nombre de usuario.'
      : '<b>Rendimiento:</b> promedio de la puntuación de aterrizaje de tus vuelos verificados que tienen velocidad vertical (VS) registrada. Se necesitan al menos 3 aterrizajes. ' +
        'Se usa el valor absoluto de la VS: ≤100 ft/min = 100 · ≤200 = 90 · ≤300 = 75 · ≤400 = 60 · ≤600 = 40 · más de 600 = 20. Desempata el mayor número de aterrizajes.';

    return head + body +
      '<div class="row" style="margin-top:14px"><button class="btn g" onclick="rkReload()">Actualizar</button></div>' +
      priv +
      '<div class="note">' + rules + '<br><br>Solo se incluyen vuelos verificados por el sistema de perfiles públicos. ' +
      'Los vuelos registrados a mano quedan sin verificar y no puntúan, por lo que no se pueden usar para manipular la clasificación.</div>';
  };

  // Resumen para el dashboard de Simuladores (solo lectura de FL; no toca Supabase por su cuenta).
  window.flStats = function () {
    sync();
    if (!curUid()) return { auth: false };
    if (FL.rows === null) return { auth: true, loaded: false, err: FL.err };
    var s = { auth: true, loaded: true, total: FL.rows.length, vsec: 0, verified: 0, pending: 0, avgVs: null }, n = 0, sum = 0;
    FL.rows.forEach(function (r) {
      if (r.verification_status === 'verified') { s.verified++; if (r.flight_status === 'completed' && r.duration_seconds) s.vsec += r.duration_seconds; }
      if (r.verification_status === 'pending_review') s.pending++;
      if (r.flight_status === 'completed' && r.landing_vs_fpm != null) { n++; sum += Math.abs(r.landing_vs_fpm); }
    });
    if (n) s.avgVs = Math.round(sum / n);
    return s;
  };

  // ── Carga de datos tras cada render ───────────────────────────────────────
  // Encadena el hook de profile.js (authPostRender) sin modificarlo.
  var prevPost = window.authPostRender;
  window.authPostRender = function () {
    if (typeof prevPost === 'function') prevPost();
    if (typeof view === 'undefined') return;
    sync();
    if (!syncUid) return;
    if (view === 'dash' && typeof zone !== 'undefined' && zone === 'sim' && FL.rows === null && !FL.loading && !FL.err) flLoad();
    if (view === 'flights' && FL.rows === null && !FL.loading && !FL.err) flLoad();
    if (view === 'rank' && RK.data[RK.kind] === null && !RK.loading && !RK.err) rkLoad();
  };

})();