// My Flight Academy - Fase 2: Autenticacion con Supabase
// JS clasico (sin modulos ES). Requiere supabase-js UMD cargado antes en index.html.
// Todas las funciones son globales (window.*).

(function () {
  'use strict';

  // ── Cliente Supabase (singleton) ──────────────────────────────────────────
  function getClient() {
    if (window._sbClient) return window._sbClient;
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY ||
        window.SUPABASE_URL.indexOf('TU_PROJECT_REF') !== -1) {
      console.warn('[auth] js/config.js no tiene credenciales reales de Supabase. La autenticacion no funcionara hasta configurarlas.');
      return null;
    }
    if (!window.supabase) {
      console.error('[auth] El SDK de Supabase no esta cargado. Verificar la etiqueta <script> en index.html.');
      return null;
    }
    window._sbClient = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY
    );
    return window._sbClient;
  }

  // ── Estado de sesion ──────────────────────────────────────────────────────
  window._authSession = null;
  window._authProfile = null;
  window._authSub     = null;

  // ── Errores en espanol ────────────────────────────────────────────────────
  function traducirError(msg) {
    if (!msg) return 'Error desconocido.';
    if (msg.indexOf('Invalid login credentials') !== -1)
      return 'Correo o contraesena incorrectos.';
    if (msg.indexOf('Email not confirmed') !== -1)
      return 'Debes confirmar tu correo antes de iniciar sesion. Revisa tu bandeja de entrada.';
    if (msg.indexOf('User already registered') !== -1)
      return 'Ya existe una cuenta con ese correo.';
    if (msg.indexOf('Password should be at least 6') !== -1 ||
        msg.indexOf('Signup requires a valid password') !== -1)
      return 'La contraesena debe tener al menos 6 caracteres.';
    if (msg.indexOf('Unable to validate email') !== -1)
      return 'El formato del correo no es valido.';
    if (msg.indexOf('over_email_send_rate_limit') !== -1 ||
        msg.indexOf('rate limit') !== -1)
      return 'Demasiados intentos. Espera un momento e intentalo de nuevo.';
    if (msg.indexOf('not authorized') !== -1)
      return 'Este correo no esta autorizado para registrarse.';
    return msg;
  }
  window.traducirError = traducirError;

  // ── Cargar perfil ─────────────────────────────────────────────────────────
  async function authGetProfile() {
    var sb = getClient();
    if (!sb || !window._authSession) return null;
    var uid = window._authSession.user.id;
    var result = await sb
      .from('profiles')
      .select('id,username,avatar_url,country,profile_visibility,created_at,updated_at')
      .eq('id', uid)
      .single();
    if (result.error) {
      console.error('[auth] Error cargando perfil:', result.error.message);
      return null;
    }
    window._authProfile = result.data;
    return result.data;
  }
  window.authGetProfile = authGetProfile;

  // ── Actualizar perfil ─────────────────────────────────────────────────────
  async function authUpdateProfile(fields) {
    var sb = getClient();
    if (!sb || !window._authSession) return { error: 'No hay sesion activa.' };
    var allowed = ['username', 'avatar_url', 'country', 'profile_visibility'];
    var safe = {};
    allowed.forEach(function(k) { if (k in fields) safe[k] = fields[k]; });
    var uid = window._authSession.user.id;
    var result = await sb
      .from('profiles')
      .update(safe)
      .eq('id', uid)
      .select()
      .single();
    if (!result.error) window._authProfile = result.data;
    return {
      data: result.data,
      error: result.error ? traducirError(result.error.message) : null
    };
  }
  window.authUpdateProfile = authUpdateProfile;

  // ── Login ─────────────────────────────────────────────────────────────────
  async function authLogin(email, pass) {
    var sb = getClient();
    if (!sb) return { error: 'Supabase no esta configurado. Ver js/config.js.' };
    var result = await sb.auth.signInWithPassword({ email: email, password: pass });
    return { data: result.data, error: result.error ? traducirError(result.error.message) : null };
  }
  window.authLogin = authLogin;

  // ── Registro ──────────────────────────────────────────────────────────────
  async function authRegister(email, pass) {
    var sb = getClient();
    if (!sb) return { error: 'Supabase no esta configurado. Ver js/config.js.' };
    var result = await sb.auth.signUp({ email: email, password: pass });
    return { data: result.data, error: result.error ? traducirError(result.error.message) : null };
  }
  window.authRegister = authRegister;

  // ── Logout ────────────────────────────────────────────────────────────────
  async function authLogout() {
    var sb = getClient();
    if (!sb) return;
    await sb.auth.signOut();
  }
  window.authLogout = authLogout;

  // ── Sesion actual ─────────────────────────────────────────────────────────
  async function authGetSession() {
    var sb = getClient();
    if (!sb) return null;
    var result = await sb.auth.getSession();
    return result.data ? result.data.session : null;
  }
  window.authGetSession = authGetSession;

  // ── Listener de estado de autenticacion ──────────────────────────────────
  // Se suscribe una sola vez. Cuando cambia la sesion, actualiza window._authSession
  // y llama a render() para reflejar el estado en la UI.
  function initAuthListener() {
    var sb = getClient();
    if (!sb || window._authSub) return;
    var subscription = sb.auth.onAuthStateChange(async function(event, session) {
      window._authSession = session;
      window._authProfile = null; // forzar recarga del perfil
      if (session) {
        authGetProfile().then(function() {
          if (typeof render === 'function') render();
        });
      } else {
        if (typeof render === 'function') render();
      }
    });
    // La API v2 devuelve { data: { subscription } }
    window._authSub = subscription.data ? subscription.data.subscription : subscription;
  }

  // Inicializar cuando el DOM este listo.
  // auth.js se carga antes de app.js, por lo que DOMContentLoaded puede
  // no haber ocurrido todavia — ambos casos se cubren.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuthListener);
  } else {
    initAuthListener();
  }

})();
