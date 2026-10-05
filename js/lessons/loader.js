// Carga todas las lecciones. Para añadir una lección nueva, agrega su archivo a esta lista.
// Los archivos que solo tienen la plantilla comentada no hacen nada hasta que los actives.
(function(){
 const base='js/lessons/',FILES=[
  'fase1-fundamentos-de-aviacion/partes-del-avion.js',
  'fase1-fundamentos-de-aviacion/controles-de-vuelo.js',
  'fase1-fundamentos-de-aviacion/pitch-roll-y-yaw.js',
  'fase1-fundamentos-de-aviacion/flaps-y-trim.js',
  'fase1-fundamentos-de-aviacion/cuatro-fuerzas-del-vuelo.js',
  'fase2-operaciones-basicas/preflight-inspection.js',
  'fase2-operaciones-basicas/checklists.js',
  'fase2-operaciones-basicas/taxi-y-takeoff.js',
  'fase2-operaciones-basicas/climb-cruise-descent.js',
  'fase2-operaciones-basicas/approach-y-landing.js',
  'fase3-navegacion/heading-track-bearing.js',
  'fase3-navegacion/vor-ndb-gps.js',
  'fase3-navegacion/waypoints-y-fixes.js',
  'fase3-navegacion/flight-planning.js',
  'fase4-meteorologia/presion-qnh-qfe.js',
  'fase4-meteorologia/viento-y-visibilidad.js',
  'fase4-meteorologia/metar-y-taf.js',
  'fase5-comunicaciones/phraseology.js',
  'fase5-comunicaciones/atis-ground-tower.js',
  'fase5-comunicaciones/readback-y-emergencias.js',
  'fase6-instrumentos/instrumentos-six-pack.js',
  'fase6-instrumentos/pfd-y-mfd-nd.js',
  'fase7-ifr/fundamentos-ifr.js',
  'fase7-ifr/ils-y-aproximaciones.js',
  'fase7-ifr/holding-y-missed-approach.js',
  'fase8-aviacion-comercial/fmc-mcdu-y-autopilot.js',
  'fase8-aviacion-comercial/sop-y-cockpit-procedures.js'
 ];
 Promise.all(FILES.map(f=>new Promise(done=>{
  const s=document.createElement('script');s.src=base+f;s.onload=s.onerror=done;document.head.appendChild(s)
 }))).then(()=>{if(typeof render==='function')render()});
})();
