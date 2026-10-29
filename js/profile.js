// My Flight Academy - Fase 2: Vistas de autenticacion y perfil
// JS clasico (sin modulos ES). Se carga despues de app.js.
// Define V.auth, V.profile y sus funciones auxiliares.

(function () {
  'use strict';

  // ── Icono de usuario (añadido al mapa global de iconos de app.js) ─────────
  if (typeof ICONS !== 'undefined') {
    ICONS.user = '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>';
  }

  // ── Estado local de la vista auth ─────────────────────────────────────────
  var _authTab = 'login'; // 'login' | 'register'

  // ── Helpers DOM ───────────────────────────────────────────────────────────
  function q(id) { return document.getElementById(id); }

  function setMsg(id, msg, isErr) {
    var el = q(id);
    if (!el) return;
    el.textContent = msg || '';
    el.className = isErr ? 'au-err' : 'au-ok';
  }

  function setLoading(id, on) {
    var el = q(id);
    if (el) {
      if (on) el.classList.add('au-loading');
      else    el.classList.remove('au-loading');
    }
  }

  // ── Cambiar tab ───────────────────────────────────────────────────────────
  window.authTab = function(t) {
    _authTab = t;
    if (typeof render === 'function') render();
    setTimeout(function() {
      var el = t === 'login' ? q('au_email') : q('au_remail');
      if (el) el.focus();
    }, 50);
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  window.authDoLogin = async function() {
    var email = q('au_email') ? q('au_email').value.trim() : '';
    var pass  = q('au_pass')  ? q('au_pass').value          : '';
    setMsg('au_err', '');
    if (!email || !pass) { setMsg('au_err', 'Completa todos los campos.', true); return; }
    setLoading('au_form', true);
    var r = await authLogin(email, pass);
    setLoading('au_form', false);
    if (r.error) { setMsg('au_err', r.error, true); }
    // Si el login tiene exito, onAuthStateChange llama a render() automaticamente.
  };

  // ── Registro ──────────────────────────────────────────────────────────────
  window.authDoRegister = async function() {
    var email = q('au_remail') ? q('au_remail').value.trim() : '';
    var pass  = q('au_rpass')  ? q('au_rpass').value          : '';
    var pass2 = q('au_rpass2') ? q('au_rpass2').value         : '';
    setMsg('au_rerr', '');
    setMsg('au_rok',  '');
    if (!email || !pass || !pass2) { setMsg('au_rerr', 'Completa todos los campos.', true); return; }
    if (pass !== pass2)            { setMsg('au_rerr', 'Las contrasenas no coinciden.', true); return; }
    if (pass.length < 6)           { setMsg('au_rerr', 'La contrasena debe tener al menos 6 caracteres.', true); return; }
    setLoading('au_rform', true);
    var r = await authRegister(email, pass);
    setLoading('au_rform', false);
    if (r.error) {
      setMsg('au_rerr', r.error, true);
      return;
    }
    // Registro exitoso
    if (r.data && r.data.session) {
      // Confirmacion de email desactivada: el usuario ya tiene sesion.
      // onAuthStateChange lo gestionara.
    } else {
      // Confirmacion de email activada: mostrar aviso.
      setMsg('au_rok', 'Cuenta creada. Revisa tu bandeja de entrada y confirma tu correo para iniciar sesion.', false);
    }
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  window.authDoLogout = async function() {
    await authLogout();
    // onAuthStateChange llama a render() automaticamente.
  };

  // ── Guardar perfil ────────────────────────────────────────────────────────
  window.authDoSaveProfile = async function() {
    var username   = q('pf_username')   ? q('pf_username').value.trim().toLowerCase()   : '';
    var country    = q('pf_country')    ? q('pf_country').value.trim().toUpperCase()     : '';
    var visibility = q('pf_visibility') ? q('pf_visibility').value                       : 'public';
    setMsg('pf_err', '');
    setMsg('pf_ok',  '');
    // Validaciones cliente
    if (username.length < 3 || username.length > 30) {
      setMsg('pf_err', 'El nombre de usuario debe tener entre 3 y 30 caracteres.', true); return;
    }
    if (!/^[a-z0-9_.-]+$/.test(username)) {
      setMsg('pf_err', 'El nombre de usuario solo puede contener letras minusculas, numeros, guiones, puntos y guiones bajos.', true); return;
    }
    if (country && !/^[A-Z]{2}$/.test(country)) {
      setMsg('pf_err', 'El codigo de pais debe ser de exactamente 2 letras mayusculas (ej. CO, ES, MX).', true); return;
    }
    setLoading('pf_form', true);
    var r = await authUpdateProfile({
      username:           username,
      country:            country || null,
      profile_visibility: visibility
    });
    setLoading('pf_form', false);
    if (r.error) { setMsg('pf_err', r.error, true); }
    else         { setMsg('pf_ok',  'Perfil guardado correctamente.', false); }
  };

  // ── Vista: Mi cuenta ──────────────────────────────────────────────────────
  V.auth = function() {
    var session = window._authSession;

    // Usuario autenticado
    if (session) {
      var profile  = window._authProfile;
      var email    = session.user ? esc(session.user.email) : 'N/D';
      var uname    = profile ? esc(profile.username) : '...';
      return '<h1>Mi cuenta</h1>' +
        '<p class="sub">Tu cuenta en My Flight Academy.</p>' +
        '<div class="card hero" style="margin-bottom:18px">' +
          '<div class="row" style="gap:16px;align-items:center">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="var(--am)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:44px;height:44px;flex-shrink:0">' +
              '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>' +
            '</svg>' +
            '<div>' +
              '<div class="big" style="font-size:22px">' + uname + '</div>' +
              '<div style="color:var(--mu);font-size:14px;margin-top:2px">' + email + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="row">' +
          '<button class="btn" onclick="go(\'profile\')">Editar perfil</button>' +
          '<button class="btn g" onclick="authDoLogout()">Cerrar sesion</button>' +
        '</div>';
    }

    // No autenticado: formularios por tab
    var tab = _authTab;
    var loginOn    = tab === 'login'    ? ' on' : '';
    var registerOn = tab === 'register' ? ' on' : '';
    var formHtml   = '';

    if (tab === 'login') {
      formHtml =
        '<div id="au_form">' +
          '<div class="au-field">' +
            '<label for="au_email">Correo electronico</label>' +
            '<input id="au_email" type="email" placeholder="tu@correo.com" autocomplete="email">' +
          '</div>' +
          '<div class="au-field">' +
            '<label for="au_pass">Contrasena</label>' +
            '<input id="au_pass" type="password" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" autocomplete="current-password"' +
            ' onkeydown="if(event.key===\'Enter\')authDoLogin()">' +
          '</div>' +
          '<div id="au_err" class="au-err" role="alert"></div>' +
          '<button class="btn" style="margin-top:14px;width:100%" onclick="authDoLogin()">Entrar</button>' +
          '<p style="margin-top:14px;font-size:13.5px;color:var(--mu)">' +
            '\u00bfNo tienes cuenta? ' +
            '<button class="au-link" onclick="authTab(\'register\')">Crear una cuenta</button>' +
          '</p>' +
        '</div>';
    } else {
      formHtml =
        '<div id="au_rform">' +
          '<div class="au-field">' +
            '<label for="au_remail">Correo electronico</label>' +
            '<input id="au_remail" type="email" placeholder="tu@correo.com" autocomplete="email">' +
          '</div>' +
          '<div class="au-field">' +
            '<label for="au_rpass">Contrasena</label>' +
            '<input id="au_rpass" type="password" placeholder="Minimo 6 caracteres" autocomplete="new-password">' +
          '</div>' +
          '<div class="au-field">' +
            '<label for="au_rpass2">Confirmar contrasena</label>' +
            '<input id="au_rpass2" type="password" placeholder="Repite la contrasena" autocomplete="new-password"' +
            ' onkeydown="if(event.key===\'Enter\')authDoRegister()">' +
          '</div>' +
          '<div id="au_rerr" class="au-err" role="alert"></div>' +
          '<div id="au_rok" class="au-ok"></div>' +
          '<button class="btn" style="margin-top:14px;width:100%" onclick="authDoRegister()">Crear cuenta</button>' +
          '<p style="margin-top:14px;font-size:13.5px;color:var(--mu)">' +
            '\u00bfYa tienes cuenta? ' +
            '<button class="au-link" onclick="authTab(\'login\')">Iniciar sesion</button>' +
          '</p>' +
        '</div>';
    }

    return '<h1>Mi cuenta</h1>' +
      '<p class="sub">Inicia sesion para sincronizar tu progreso entre dispositivos.</p>' +
      '<div class="card" style="max-width:480px">' +
        '<div class="au-tabs" role="tablist">' +
          '<button class="au-tab' + loginOn    + '" role="tab" aria-selected="' + (tab==='login'   ) + '" onclick="authTab(\'login\')"   >Iniciar sesion</button>' +
          '<button class="au-tab' + registerOn + '" role="tab" aria-selected="' + (tab==='register') + '" onclick="authTab(\'register\')">Crear cuenta</button>' +
        '</div>' +
        formHtml +
      '</div>' +
      '<div class="note" style="max-width:480px;margin-top:14px">' +
        'Tu progreso local (lecciones, examenes, vuelos) se conserva en este navegador aunque no tengas cuenta. ' +
        'La cuenta te permite sincronizar tu progreso entre dispositivos en fases futuras.' +
      '</div>';
  };

  // ── Vista: Perfil ─────────────────────────────────────────────────────────
  V.profile = function() {
    if (!window._authSession) {
      return '<h1>Perfil</h1>' +
        '<p class="sub">Necesitas iniciar sesion para ver tu perfil.</p>' +
        '<button class="btn" onclick="go(\'auth\')">Ir a Mi cuenta</button>';
    }
        var profile = window._authProfile;
    if (!profile && window._authProfileErr) {
      return '<h1>Perfil</h1>' +
        '<p class="sub">No se pudo cargar tu perfil.</p>' +
        '<div class="card" style="max-width:560px">' +
          '<p class="au-err">Revisa tu conexion e intentalo de nuevo.</p>' +
          '<div class="row" style="margin-top:14px">' +
            '<button class="btn" onclick="window._authProfileErr=false;render()">Reintentar</button>' +
            '<button class="btn g" onclick="go(\'auth\')">Volver</button>' +
          '</div>' +
        '</div>';
    }
    if (!profile) {
      return '<h1>Perfil</h1>' +
        '<p class="sub">Cargando datos del perfil\u2026</p>' +
        '<div class="card" style="max-width:560px"><p style="color:var(--mu)">Cargando\u2026</p></div>';
    }
    var uname      = esc(profile.username   || '');
    var country    = esc(profile.country    || '');
    var visibility = profile.profile_visibility || 'public';
    var created    = profile.created_at
      ? new Date(profile.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
      : '\u2014';
    var selPub  = visibility === 'public'  ? ' selected' : '';
    var selPriv = visibility === 'private' ? ' selected' : '';

    return '<h1>Perfil</h1>' +
      '<p class="sub">Gestiona la informacion de tu cuenta.</p>' +
      '<div class="card" style="max-width:560px" id="pf_form">' +
        '<h2 style="margin-top:0">Informacion publica</h2>' +
        '<div class="au-field">' +
          '<label for="pf_username">Nombre de usuario</label>' +
          '<input id="pf_username" type="text" value="' + uname + '"' +
          ' maxlength="30" autocomplete="username" spellcheck="false"' +
          ' placeholder="Ej. piloto_virtual"' +
          ' oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9_.-]/g,\'\')">' +
          '<div class="au-hint">Solo minusculas, numeros, guiones ( - ), puntos ( . ) y guiones bajos ( _ ). Entre 3 y 30 caracteres.</div>' +
        '</div>' +
        '<div class="au-field">' +
          '<label for="pf_country">Pais (codigo ISO, opcional)</label>' +
          '<input id="pf_country" type="text" value="' + country + '"' +
          ' maxlength="2" placeholder="Ej. CO, ES, MX"' +
          ' oninput="this.value=this.value.toUpperCase().replace(/[^A-Z]/g,\'\')">' +
          '<div class="au-hint">Codigo de dos letras segun ISO 3166-1 (Colombia = CO, Espana = ES).</div>' +
        '</div>' +
        '<h3 style="margin:22px 0 4px">Perfil de piloto virtual (Simuladores)</h3>' +
        '<div class="au-hint" style="margin-bottom:10px">Controla si apareces en los rankings de Simuladores. No afecta a tu progreso académico.</div>' +
        '<div class="au-field">' +
          '<label for="pf_visibility">Visibilidad del perfil</label>' +
          '<select id="pf_visibility">' +
            '<option value="public"' + selPub  + '>Publico \u2014 visible en rankings y comunidad</option>' +
            '<option value="private"' + selPriv + '>Privado \u2014 solo tu puedes verlo</option>' +
          '</select>' +
        '</div>' +
        '<div id="pf_err" class="au-err" role="alert"></div>' +
        '<div id="pf_ok"  class="au-ok"  role="status"></div>' +
        '<div class="row" style="margin-top:18px">' +
          '<button class="btn" onclick="authDoSaveProfile()">Guardar cambios</button>' +
          '<button class="btn g" onclick="go(\'auth\')">Volver</button>' +
        '</div>' +
      '</div>' +
      '<div class="card" style="max-width:560px;margin-top:14px">' +
        '<h3>Informacion de la cuenta</h3>' +
        '<div class="tl">' +
          '<div><span class="mono" style="color:var(--mu);min-width:110px">Correo</span>' +
            '<span>' + esc(window._authSession.user.email) + '</span></div>' +
          '<div><span class="mono" style="color:var(--mu);min-width:110px">Miembro desde</span>' +
            '<span>' + created + '</span></div>' +
        '</div>' +
        '<p style="margin-top:14px;font-size:13px;color:var(--mu)">' +
          'Para cambiar tu correo o contrasenha, usa las opciones de Supabase Auth en fases futuras.' +
        '</p>' +
      '</div>';
  };

  // ── Hook post-render ──────────────────────────────────────────────────────
  // render() en app.js llama a authPostRender() despues de actualizar el DOM.
  window.authPostRender = function() {
    if (typeof view === 'undefined') return;
    // Enfocar el primer input al navegar a auth
    if (view === 'auth' && !window._authSession) {
      setTimeout(function() {
        var el = _authTab === 'login' ? q('au_email') : q('au_remail');
        if (el) el.focus();
      }, 60);
    }
    // Cargar perfil si estamos en la vista de perfil y no se ha cargado aun
    if (view === 'profile' && window._authSession && !window._authProfile && !window._authProfileErr) {
      authGetProfile().then(function() {
        if (typeof render === 'function') render();
      });
    }
  };

})();