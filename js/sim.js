// My Flight Academy - Simulador: entrenador interactivo de checklists
// Sustituye a V.sim de app.js. Estado en S.sim = {ac, mode, chk:{idPaso:1}} (mismo localStorage 'fa_state').
// Las casillas son una marca manual del usuario: no verifican nada en el simulador.
// Para añadir un paso: agrega un objeto a la fase correspondiente de DATA (campos opcionales; lo que falte no se muestra o se marca "pendiente").
(function(){
'use strict';
Object.assign(ICONS,{chev:'<path d="m6 9 6 6 6-6"/>',rst:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>'});
const A='fase8-aviacion-comercial/sop-y-cockpit-procedures/',C='fase1-fundamentos-de-aviacion/';
const SRC_A='Manual y Quick Reference Card del A320neo V2 de MSFS 2024 (flightsimulator.com/aircraft-manuals). Ubicaciones y propósitos: descripción general del A320; consulta el manual para el detalle de cada control.';
const SRC_C='Adaptación didáctica general. Referencia real: POH de la variante (Sección 4, Procedimientos normales), que no está incluido en el proyecto. Sin validar con el POH ni con MSFS 2024.';
const DATA=[
{id:'c172',n:'Cessna 172',src:SRC_C,note:'Procedimientos de referencia propios de cada variante (G1000 o instrumentos analógicos). Esta lista no asume una variante concreta.',ph:[
 {id:'pre',n:'Inspección pre-vuelo',pend:'Pendiente de completar: faltan la inspección exterior completa y la de cabina, que deben tomarse del POH de la variante.',s:[
  {id:'c-pre-tren',n:'Neumáticos y tren principal',cat:'Exterior',do:'Revisa cada neumático (desgaste, cortes, aspecto de la presión) y el estado del tren y de los frenos.',why:'Un neumático o un freno en mal estado afecta al rodaje, al despegue y al aterrizaje.',at:'En el recorrido de inspección exterior alrededor del avión; no es un control de cabina.',img:[[C+'partes-del-avion/tren_aterrizaje.JPG','Neumático y pata del tren de aterrizaje (foto de la lección «Partes del avión»). Imagen de referencia, no de la variante de MSFS.']]},
  {id:'c-pre-flaps',n:'Flaps (inspección exterior)',cat:'Exterior',do:'Comprueba que los flaps y sus articulaciones están en buen estado y sin daños visibles.',img:[[C+'partes-del-avion/Flaps_cessna.jpg','Flap de una Cessna 172 vista desde fuera. Referencia de la superficie, no del selector de cabina.']]}]},
 {id:'start',n:'Antes de arrancar',s:[
  {id:'c-st-freno',lg:'Cessna 172Before startFreno de estacionamiento',n:'Freno de estacionamiento',cat:'Cabina',do:'Comprueba que el freno de estacionamiento está puesto.',why:'Evita que el avión se mueva al aplicar potencia durante el arranque.',at:'Zona inferior izquierda del panel; la posición exacta depende de la variante.'},
  {id:'c-st-master',lg:'Cessna 172Before startMaster (batería)',n:'Master (batería)',cat:'Eléctrico',do:'Pon el interruptor MASTER en ON. Mantén el interruptor de aviónica en OFF hasta después del arranque del motor.',why:'Da corriente al avión; la aviónica se protege de los picos eléctricos del arranque.'},
  {id:'c-st-comb',lg:'Cessna 172Before startCombustible',n:'Combustible',cat:'Combustible',do:'Comprueba la cantidad de combustible y pon el selector en BOTH (si tu variante lo tiene).',why:'Confirma que hay combustible suficiente y que el motor se alimenta de ambos depósitos.'},
  {id:'c-st-ctrl',lg:'Cessna 172Before startControles libres',n:'Controles libres',cat:'Controles',do:'Mueve yoke y pedales y comprueba que se mueven libres y en el sentido correcto.',why:'Detecta bloqueos o restricciones antes de rodar.',at:'Yoke frente a cada asiento; pedales en el suelo de la cabina.',img:[[C+'controles-de-vuelo/cabina_cessna.jpg','Yoke, pedales y panel de instrumentos de una Cessna 172 (esquema con etiquetas). Sirve para ubicarlos; no muestra interruptores concretos.']]},
  {id:'c-st-puertas',lg:'Cessna 172Before startPuertas y cinturones',n:'Puertas y cinturones',cat:'Cabina',do:'Cierra y asegura las puertas y abróchate el cinturón.',why:'Evita que una puerta se abra en rodaje o despegue.'}]},
 {id:'to',n:'Antes del despegue',s:[
  {id:'c-to-flaps',lg:'Cessna 172Before takeoffFlaps',n:'Flaps',cat:'Controles',do:'Coloca los flaps en la posición que indique el procedimiento de despegue de tu variante y comprueba que coinciden con el selector.',warn:'La posición depende del tipo de despegue y del POH; aquí no se fija ningún valor.',img:[[C+'partes-del-avion/Flaps_cessna.jpg','Flap de una Cessna 172 (vista exterior). Referencia de la superficie, no del selector de cabina.']]},
  {id:'c-to-trim',lg:'Cessna 172Before takeoffTrim',n:'Trim',cat:'Controles',do:'Pon el compensador de profundidad (elevator trim) en la posición de despegue.',why:'Reduce la fuerza que debes hacer sobre el yoke al despegar.',at:'Rueda de trim en el pedestal central; puede variar según la variante.',img:[[C+'flaps-y-trim/trim_example.jpg','Esquema didáctico del elevator trim (lección «Flaps y Trim»). No es la cabina del simulador.']]},
  {id:'c-to-mezcla',lg:'Cessna 172Before takeoffMezcla y hélice',n:'Mezcla y régimen del motor',cat:'Motor',do:'Ajusta la mezcla según el procedimiento de tu variante y comprueba las RPM en la prueba de motor.',warn:'El nombre original del paso («Mezcla y hélice») se corrigió: el C172 de serie tiene hélice de paso fijo y no tiene palanca de hélice. En aeropuertos de gran elevación el POH indica un ajuste especial de la mezcla.'},
  {id:'c-to-instr',lg:'Cessna 172Before takeoffInstrumentos',n:'Instrumentos',cat:'Panel',do:'Comprueba que los instrumentos de motor están en sus rangos normales y que los de vuelo muestran valores coherentes.',img:[[C+'partes-del-avion/cabina_cessna.jpg','Instrumentos principales de una Cessna 172 (ilustración con etiquetas, no una captura de MSFS).']]},
  {id:'c-to-freq',lg:'Cessna 172Before takeoffFrecuencia de torre',n:'Frecuencia de torre',cat:'Radio',do:'Sintoniza la frecuencia de torre en COM y comprueba el volumen.',at:'Panel de radios/aviónica; depende de la variante.'}]},
 {id:'app',n:'Aproximación y aterrizaje',pend:'Pendiente de completar: aún no hay contenido validado para esta fase.',s:[]},
 {id:'post',n:'Después del vuelo',pend:'Pendiente de completar: aún no hay contenido validado para esta fase.',s:[]}]},
{id:'a320',n:'A320neo',src:SRC_A,note:'A320neo V2 de MSFS 2024. Basado en su manual y su QRC oficiales; los valores de las capturas son ejemplos.',ph:[
 {id:'cd',n:'Cold & Dark',s:[
  {id:'a-cd-mandos',n:'Mandos en posición segura',cat:'Cabina',do:['Spoilers retraídos y desarmados','Flaps en 0','Palancas de potencia en IDLE','Limpiaparabrisas en OFF'],why:'Parte de una configuración conocida antes de energizar el avión.'},
  {id:'a-cd-bat',lg:'A320neoCold & DarkBaterías',n:'Baterías',cat:'Overhead',do:'Enciende BAT 1 y BAT 2.',why:'Dan la energía inicial. Con baterías cargadas el APU puede arrancar sin energía externa.',at:'Panel superior (overhead), sección eléctrica (ELEC).'},
  {id:'a-cd-ext',lg:'A320neoCold & DarkAlimentación externa',n:'Alimentación externa (EXT PWR)',cat:'Overhead',do:'Si hay GPU disponible, conecta EXT PWR cuando aparezca AVAIL.',why:'La GPU aporta electricidad, no aire para arrancar motores.',at:'Panel superior (overhead), sección eléctrica.',ms:'Activa la GPU en la tablet (pestaña Ground) y espera a que EXT PWR muestre AVAIL.',img:[[A+'conectar_energia_externa.png','Overhead con el cursor sobre el botón de energía externa (EXT PWR).']]},
  {id:'a-cd-adirs',lg:'A320neoCold & DarkADIRS',n:'Inerciales (ADIRS)',cat:'Overhead',do:'Gira los tres selectores ADIRS a NAV y deja el avión inmóvil mientras se alinean. Sigue el progreso en el ECAM.',why:'Las referencias inerciales necesitan alinearse para dar actitud, rumbo y posición. En Before Start los tres deben estar en NAV.',at:'Panel superior (overhead), sección ADIRS.',src:'QRC oficial del A320neo V2: lista Before Start (ADIRS: NAV).',img:[[A+'Inerciales.png','Selectores ADIRS 1, 3 y 2 (de izquierda a derecha) en NAV.']]},
  {id:'a-cd-luces',lg:'A320neoCold & DarkLuces de cabina',n:'Luces y señales',cat:'Overhead',do:['NAV/LOGO y STROBE según la situación','EMER EXIT LT en ARM','NO SMOKING y SEAT BELTS en ON/AUTO según corresponda'],at:'Panel superior (overhead), luces exteriores y señales.',src:'QRC oficial del A320neo V2: lista Before Start (Signs: ON/AUTO).'},
  {id:'a-cd-oxi',n:'Oxígeno de la tripulación',cat:'Overhead',do:'Enciende CREW SUPPLY.',at:'Panel superior (overhead), sección OXYGEN.',img:[[A+'Conectar_oxigeno.png','Panel de oxígeno con el cursor sobre CREW SUPPLY.']]},
  {id:'a-cd-apu',n:'APU',cat:'Overhead',do:'Pulsa APU MASTER SW y después APU START. Espera a que el ECAM muestre AVAIL.',why:'Suministra electricidad y aire. Con el APU disponible puedes desconectar la GPU.',at:'Panel superior (overhead), sección APU.'}]},
 {id:'cab',n:'Preparación de cabina (EFB)',s:[
  {id:'a-cb-puertas',n:'Abrir puertas',cat:'EFB',do:'Abre las puertas desde la pestaña Ground y conecta la pasarela.',ms:'Tablet EFB → pestaña Ground → control de puertas.',img:[[A+'abrir_puertas.png','Control de puertas en la tablet (EFB).']]},
  {id:'a-cb-carga',n:'Cargar combustible, pasajeros y carga',cat:'EFB',do:'Carga el combustible, los pasajeros y la carga útil del vuelo.',why:'Los pesos determinan los cálculos de rendimiento de despegue.',ms:'Tablet EFB → pestaña de carga (Payload).',img:[[A+'como_cargar.png','Pantalla de carga de la tablet (EFB).']]}]},
 {id:'mcdu',n:'Programación del MCDU',s:[
  {id:'a-mc-clr',n:'INIT A: limpiar mensajes (CLR) e INIT',cat:'MCDU',do:'Limpia los mensajes con CLR y, con la pantalla libre, pulsa INIT.',at:'MCDU, en el pedestal central.',img:[[A+'boton_CLR.png','MCDU con el botón CLR.']]},
  {id:'a-mc-fn',n:'INIT A: número de vuelo',cat:'MCDU',do:'Escribe el número de vuelo y pulsa el botón junto a FLT NBR.',img:[[A+'fly_number.png','Página INIT A con el número de vuelo (ejemplo).']]},
  {id:'a-mc-block',n:'INIT B: ZFW/ZFWCG y BLOCK',cat:'MCDU',do:'Introduce ZFW/ZFWCG y el combustible BLOCK de tu carga.',why:'Un peso mal introducido altera todos los cálculos de rendimiento.',img:[[A+'botom_block.png','Botones ZFW/ZFWCG y BLOCK.']]},
  {id:'a-mc-ifr',n:'Autorización IFR del ATC',cat:'EFB / ATC',do:'Solicita la autorización IFR y anota pista, SID, altitud inicial y código de transpondedor.',img:[[A+'solicitud_IFR.png','Ventana de comunicación con la autorización IFR (ejemplo).']]},
  {id:'a-mc-alt',n:'Altitud inicial en el FCU',cat:'FCU',do:'Selecciona la altitud inicial indicada por el ATC.',why:'Seleccionar la altitud no basta: el avión la captura según el modo activo.',at:'Panel FCU, bajo el parabrisas.',img:[[A+'altitud_autopilot.png','Vista general del panel FCU en la cabina del simulador.']]},
  {id:'a-mc-sync',n:'EFB Takeoff: SYNC',cat:'EFB',do:'Pulsa SYNC para cargar los datos de clima y pista.',img:[[A+'boton_SYNC.png','Pestaña Takeoff con el botón SYNC.']]},
  {id:'a-mc-calc',n:'EFB Takeoff: CALCULATE y SEND TO FMGS',cat:'EFB',do:'Pulsa CALCULATE y, cuando muestre los datos, SEND TO FMGS.',warn:'Si el cálculo da error, revisa el peso, la pista y las condiciones.',img:[[A+'boton_calculate.png','Datos enviados al FMGS.']]},
  {id:'a-mc-v',n:'PERF: V1, VR y V2',cat:'MCDU',do:'Introduce en PERF los V1, VR y V2 calculados para tu vuelo.',why:'V1 es la velocidad de decisión, VR la de rotación y V2 la de seguridad en el despegue.',warn:'Los valores de la captura son un ejemplo: cada vuelo tiene los suyos.',img:[[A+'velocidades.png','Página PERF con V1, VR y V2 (ejemplo).']]},
  {id:'a-mc-ths',n:'PERF: FLEX, flaps y THS',cat:'MCDU',do:'Introduce la temperatura FLEX, los flaps y el THS que calcula la tablet para tu vuelo.',warn:'Los valores de la captura son un ejemplo.',img:[[A+'THS.png','Datos de rendimiento con FLEX y THS (ejemplo).']]},
  {id:'a-mc-conf',n:'PERF: CONFIRM TO DATA',cat:'MCDU',do:'Pulsa CONFIRM TO DATA y comprueba que los datos coinciden con la tablet.',img:[[A+'confirm.png','Página PERF confirmada.']]},
  {id:'a-mc-sid',n:'F-PLN: salida (pista y SID)',cat:'MCDU',do:'En F-PLN pulsa la tecla de línea L1 y DEPARTURE. Compara RWY y SID con la autorización del ATC.',img:[[A+'aeropuerto_salida.png','F-PLN con la pista de salida.'],[A+'departure.png','Página DEPARTURE.'],[A+'return.png','Pistas y SID disponibles, con RETURN.']]},
  {id:'a-mc-star',n:'F-PLN: llegada (APPR – VIA – STAR)',cat:'MCDU',do:'Entra al aeropuerto de llegada y pulsa ARRIVAL. Selecciona la aproximación y, si existe procedimiento de llegada, el STAR; después pulsa INSERT.',why:'La llegada debe coincidir con el ATC y con las publicaciones vigentes.',img:[[A+'llegada.png','F-PLN con el aeropuerto de llegada.'],[A+'APPR.png','Selección de la aproximación (APPR).'],[A+'NINO6C.png','Selección de VIA/STAR (ejemplo).']]},
  {id:'a-mc-tray',n:'Revisar el trayecto',cat:'ND / MCDU',do:'Revisa en el plan de vuelo cada waypoint y sus restricciones de altitud y velocidad hasta el destino.',img:[[A+'trayecto.png','Controles de la pantalla de navegación para revisar el trayecto.'],[A+'pantalla_trayecto.png','Trayecto visto en la pantalla de navegación.']]}]},
 {id:'arr',n:'Antes del arranque',s:[
  {id:'a-ar-qrc',n:'Lista Before Start',cat:'QRC',do:['Cabina preparada y ACARS INIT','Combustible: cantidad comprobada','Datos de despegue y referencia barométrica ajustados','Palancas de potencia en IDLE','Transpondedor y freno de estacionamiento según se requiera'],src:'QRC oficial del A320neo V2: lista Before Start.'},
  {id:'a-ar-bleed',n:'APU BLEED y señales',cat:'Overhead',do:['Conecta APU BLEED cuando el APU esté disponible','Comprueba SEAT BELTS y NO SMOKING'],why:'El arranque de los motores necesita aire de sangrado.',img:[[A+'apu_bleed.png','Panel de aire con el cursor sobre APU BLEED.']]},
  {id:'a-ar-gpu',n:'Desconectar EXT PWR y GPU',cat:'Overhead / EFB',do:'Cuando el APU suministre energía, desconecta EXT PWR y desactiva la GPU en la pestaña Ground.'},
  {id:'a-ar-beacon',lg:'A320neoBefore startBeacon ON',n:'Beacon',cat:'Overhead',do:'Enciende la luz BEACON.',at:'Panel superior (overhead), luces exteriores.',src:'QRC oficial del A320neo V2: lista Before Start (Beacon: ON).'},
  {id:'a-ar-bombas',n:'Bombas de combustible',cat:'Overhead',do:'Enciende las bombas de combustible.',at:'Panel superior (overhead), sección FUEL.',img:[[A+'bombas.png','Panel de combustible.']]},
  {id:'a-ar-ign',n:'Selector de motor en IGN/START',cat:'Pedestal',do:'Pon el selector de modo de motor en IGN/START.',at:'Pedestal central, junto a los conmutadores ENG MASTER.',img:[[A+'start.png','Selector de modo de motor en IGN/START.']]},
  {id:'a-ar-puertas',lg:'A320neoBefore startPuertas cerradas',n:'Puertas cerradas',cat:'EFB',do:'Cierra puertas y ventanas (CLOSE ALL en Ground).',src:'QRC oficial del A320neo V2: lista Before Start (Windows/Doors: CLOSED).'},
  {id:'a-ar-push',lg:'A320neoBefore startFreno de estacionamiento',n:'Autorización y pushback',cat:'ATC / EFB',do:'Solicita autorización de pushback y arranque. Quita el freno de estacionamiento cuando corresponda al pushback.'}]},
 {id:'mot',n:'Arranque y después del arranque',s:[
  {id:'a-mo-m2',n:'Primer motor',cat:'Pedestal',do:'Con IGN/START seleccionado, mueve el ENG MASTER del motor a arrancar a ON y vigila los parámetros en el ECAM hasta que estabilice. Habitualmente se arranca primero el motor 2.'},
  {id:'a-mo-m1',n:'Segundo motor',cat:'Pedestal',do:'Repite con el otro motor y espera a que estabilice.'},
  {id:'a-mo-apu',n:'Selector de motor y APU',cat:'Overhead / Pedestal',do:'Devuelve el selector de modo de motor a NORM y apaga APU BLEED y APU MASTER SW si ya no se necesitan.'},
  {id:'a-mo-qrc',n:'Lista After Start',cat:'QRC',do:['Anti-ice según se requiera','Estado del ECAM comprobado','Trim de cabeceo ajustado y trim de timón a cero','Equipo de tierra despejado'],src:'QRC oficial del A320neo V2: lista After Start.'},
  {id:'a-mo-luces',n:'Luces de rodaje',cat:'Overhead',do:'Ajusta las luces de rodaje según corresponda.',src:'QRC oficial del A320neo V2: luces exteriores según se requiera.'}]},
 {id:'bto',n:'Antes del despegue',s:[
  {id:'a-mo-flt',n:'Mandos de vuelo e instrumentos',cat:'ECAM / PFD',do:'Comprueba los mandos de vuelo con la página FLT CTL del ECAM y verifica los instrumentos de vuelo.',src:'QRC oficial del A320neo V2: lista Before Takeoff.'},
  {id:'a-mo-flaps',n:'Flaps confirmados',cat:'Pedestal',do:'Confirma que la posición de flaps coincide con la introducida en PERF.',src:'QRC oficial del A320neo V2: lista Before Takeoff (Flap Setting: CONFIRM).'},
  {id:'a-bt-ths',n:'Trim de cabeceo (THS)',cat:'Pedestal',do:'Comprueba que el THS corresponde al valor de los datos de despegue.',at:'Rueda de trim en el pedestal.',src:'QRC oficial del A320neo V2: lista After Start (Pitch Trim: SET).'},
  {id:'a-mo-brk',n:'Auto brake en MAX',cat:'Panel central',do:'Selecciona AUTO BRK en MAX.',src:'QRC oficial del A320neo V2: lista Before Takeoff (Auto Brake: MAX).',img:[[A+'frenos_automaticos.png','Panel AUTO BRK.']]},
  {id:'a-bt-fd',n:'Fly director',cat:'Glareshield',do:'Comprueba que el fly director está conectado.',at:'Panel EFIS, bajo el parabrisas.',img:[[A+'fly_director.png','Botón FD del panel EFIS.']]},
  {id:'a-bt-ta',n:'Transpondedor y TCAS',cat:'Pedestal',do:'Ajusta el transpondedor con el código del ATC y el modo TCAS.',src:'QRC oficial del A320neo V2: lista Before Takeoff (ATC y TCAS: SET).',img:[[A+'verificar.png','Panel del transpondedor con un código de ejemplo.'],[A+'mete.png','Panel del transpondedor y TCAS.']]},
  {id:'a-bt-brief',n:'Briefing, pista y cabina',cat:'QRC',do:['Briefing confirmado','V1, VR, V2 y FLEX anunciados','Memo del ECAM sin elementos azules para el despegue','Configuración de despegue en NORM y pista confirmada','Tripulación de cabina avisada'],src:'QRC oficial del A320neo V2: lista Before Takeoff.'}]},
 {id:'asc',n:'Despegue y ascenso',s:[
  {id:'a-as-tren',n:'Tren arriba',cat:'Panel central',do:'Retrae el tren al confirmar el ascenso positivo.',why:'V1 es la velocidad de decisión de despegue: no es la señal para subir el tren ni para conectar el piloto automático.',src:'QRC oficial del A320neo V2: lista After Takeoff/Climb (Landing Gear: UP).'},
  {id:'a-as-flaps',n:'Flaps retraídos',cat:'Pedestal',do:'Retrae los flaps por pasos al alcanzar las velocidades de referencia del PFD (F y S), según la configuración de despegue usada.',src:'QRC oficial del A320neo V2: lista After Takeoff/Climb (Flaps: RETRACTED).'},
  {id:'a-as-ap',n:'Piloto automático y gestión de la velocidad',cat:'FCU',do:'Conecta el piloto automático cuando se cumplan las condiciones del avión y del modo de vuelo, y sigue el modo activo en el FMA.'},
  {id:'a-as-std',n:'Referencia barométrica',cat:'EFIS',do:'Cambia entre QNH y STD en la altitud o nivel de transición publicado para el aeropuerto o indicado por el ATC.',src:'QRC oficial del A320neo V2: After Takeoff/Climb (Baro Ref: SET).',img:[[A+'presion_estandar.png','Selector de presión barométrica en STD.']]},
  {id:'a-as-alt',n:'Altitud autorizada en el FCU',cat:'FCU',do:'Selecciona la altitud que indique el ATC y comprueba en el FMA que el avión la captura.'},
  {id:'a-as-packs',n:'Packs',cat:'Overhead',do:'Comprueba los packs de aire acondicionado en ON.',src:'QRC oficial del A320neo V2: lista After Takeoff/Climb (Packs: ON).'}]},
 {id:'crc',n:'Crucero',s:[
  {id:'a-cr-ruta',n:'Seguimiento de la ruta',cat:'ND / MCDU',do:'Comprueba que la ruta, los modos laterales y verticales y la velocidad corresponden al plan de vuelo y al ATC.'},
  {id:'a-cr-niv',n:'Cambios de nivel',cat:'FCU',do:'Selecciona el nuevo nivel autorizado, comprueba el modo en el FMA y confirma que el avión lo captura.'}]},
 {id:'lan',n:'Descenso y aproximación',s:[
  {id:'a-ln-mcdu',n:'Preparar la llegada',cat:'MCDU',do:'Revisa el STAR, la aproximación y sus restricciones en el plan de vuelo. Corrige si no coinciden con el ATC.',src:'QRC oficial del A320neo V2: lista Approach (Briefing: CONFIRMED).'},
  {id:'a-ln-alt',n:'Altitud de descenso',cat:'FCU',do:'Selecciona la altitud de descenso autorizada y comprueba el modo vertical en el FMA.'},
  {id:'a-ln-10k',n:'Cinturones',cat:'Overhead',do:'Enciende las señales de cinturones.',src:'QRC oficial del A320neo V2: lista Approach (Seat Belts: ON).'},
  {id:'a-ln-spl',n:'Speed brakes (si hacen falta)',cat:'Pedestal',do:'Úsalos solo si la trayectoria y la velocidad lo requieren y respetando sus limitaciones.'},
  {id:'a-ln-qnh',n:'Referencia barométrica',cat:'EFIS',do:'Ajusta el QNH indicado por el ATC al cruzar la altitud/nivel de transición del aeropuerto.',src:'QRC oficial del A320neo V2: lista Approach (Baro Ref: SET).'},
  {id:'a-ln-min',n:'Mínimos MDA/DH',cat:'EFIS / MCDU',do:'Ajusta el MDA/DH de la aproximación seleccionada.',src:'QRC oficial del A320neo V2: lista Approach (MDA/DH: SET).'},
  {id:'a-ln-flaps',n:'Velocidad y flaps',cat:'Pedestal',do:'Reduce velocidad y extiende los flaps por pasos según las velocidades de referencia.',src:'QRC oficial del A320neo V2: lista Landing (Flaps: SET).'},
  {id:'a-ln-appr',n:'Modos de aproximación (LOC/APPR)',cat:'FCU',do:'Sintoniza el ILS, arma LOC/APPR según la aproximación y confirma la captura del localizador y la senda en el FMA.'},
  {id:'a-ln-tren',n:'Tren abajo y lista Landing',cat:'Panel central',do:['Tren DOWN y tres luces verdes','Spoilers armados (ARM)','Memo LDG sin elementos azules','Señales ON y tripulación avisada'],why:'El tren se extiende como parte de la preparación de la aproximación.',src:'QRC oficial del A320neo V2: lista Landing.'},
  {id:'a-ln-brk',n:'Autobrake',cat:'Panel central',do:'Selecciona el autobrake que corresponda a la pista, las condiciones y el procedimiento aplicable.'},
  {id:'a-ln-ap',n:'Auto thrust y piloto automático',cat:'FCU',do:'Deja el auto thrust en SPEED u OFF. Desconecta el piloto automático según el tipo de aproximación, los mínimos y las capacidades del avión.',src:'QRC oficial del A320neo V2: lista Landing (Auto Thrust: SPEED/OFF).'},
  {id:'a-ln-est',n:'Aproximación estabilizada',cat:'PFD',do:'Verifica que configuración, velocidad y trayectoria son estables antes de los criterios del procedimiento aplicable.'}]},
 {id:'ldg',n:'Aterrizaje',s:[
  {id:'a-ln-toque',n:'Toma de contacto y frenado',cat:'Pedestal',do:'Tras la toma de contacto, comprueba que los spoilers se despliegan, usa la reversa y el frenado (automático o manual) según las condiciones y mantén el control direccional.'}]},
 {id:'post',n:'Después de aterrizar',s:[
  {id:'a-po-land',n:'Lista After Landing',cat:'QRC',do:['Flaps retraídos y spoilers desarmados','APU: START','Radar y PWS en OFF','Luces exteriores según se requiera'],at:'Pedestal y panel superior.',src:'QRC oficial del A320neo V2: lista After Landing.',img:[[A+'meteorologia.png','Controles del radar meteorológico.']]}]},
 {id:'park',n:'Estacionamiento y apagado',s:[
  {id:'a-po-freno',n:'Freno de estacionamiento y calzos',cat:'Pedestal',do:'Detén el avión en el puesto, pon el freno de estacionamiento y los calzos según se requiera.',src:'QRC oficial del A320neo V2: lista Parking.'},
  {id:'a-po-gpu',n:'Energía externa (opcional)',cat:'EFB',do:'Conecta la GPU si corresponde.'},
  {id:'a-po-mot',n:'Lista Parking',cat:'QRC',do:['APU BLEED en ON','Motores en OFF','Cinturones en OFF','Bombas de combustible en OFF','Luces exteriores y transpondedor según se requiera'],src:'QRC oficial del A320neo V2: lista Parking.'},
  {id:'a-po-off',n:'Lista Securing',cat:'QRC',do:['ADIRS en OFF','Oxígeno en OFF','APU BLEED en OFF','Luces de emergencia en OFF','APU y baterías en OFF'],src:'QRC oficial del A320neo V2: lista Securing Aircraft.'}]}]}
];
const NOTE='Estas listas son simplificadas para práctica en simulador y no sustituyen el manual ni un procedimiento operacional oficial. Marcar un paso es una anotación manual tuya: no valida nada en MSFS 2024. Los procedimientos reales dependen del avión, del manual (AFM/FCOM) y de la autoridad aeronáutica.';
const BY={};DATA.forEach(a=>a.ph.forEach(p=>p.s.forEach(s=>{BY[s.id]={a,p,s}})));
// Estado: S.sim persiste en el localStorage de la app; las filas abiertas solo viven en memoria
const st=S.sim=Object.assign({ac:'c172',mode:'learn',chk:{}},S.sim);
if(!st.chk||typeof st.chk!=='object')st.chk={};
if(!DATA.some(a=>a.id===st.ac))st.ac='c172';
if(!st.mig){st.mig=1;S.chk=S.chk||{};Object.values(BY).forEach(({s})=>{if(s.lg&&S.chk[s.lg])st.chk[s.id]=1});save()} // trae las marcas de las listas anteriores
const open=new Set(),cur=()=>DATA.find(a=>a.id===st.ac);
const cnt=p=>p.s.filter(s=>st.chk[s.id]).length;
const L=(t,h)=>`<div class="sm-f"><div class="cap">${t}</div>${h}</div>`;
const pend=t=>`<p class="sm-pd">${t}</p>`;
function bodyH(a,s){
 let h=L('¿QUÉ DEBES HACER?',Array.isArray(s.do)?`<ul>${s.do.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<p>${esc(s.do)}</p>`);
 if(s.why)h+=L('¿PARA QUÉ SIRVE?',`<p>${esc(s.why)}</p>`);
 if(s.at)h+=L('¿DÓNDE LO ENCUENTRAS?',`<p>${esc(s.at)}</p>`);
 if(s.img)h+=L('REFERENCIA VISUAL',`<div class="sm-figs">${s.img.map(i=>`<figure class="sm-fig"><a href="images/${encodeURI(i[0])}" target="_blank" rel="noopener" title="Abrir la imagen completa"><img loading="lazy" src="images/${encodeURI(i[0])}" alt="${esc(i[1])}"></a><figcaption>${esc(i[1])}</figcaption></figure>`).join('')}</div>`);
 if(s.ms)h+=L('CÓMO LOCALIZARLO EN MSFS 2024',`<p>${esc(s.ms)}</p>`);
 if(s.tip)h+=L('CONSEJO DE APRENDIZAJE',`<p>${esc(s.tip)}</p>`);
 if(s.warn)h+=`<div class="sm-w"><b>Verificar:</b> ${esc(s.warn)}</div>`;
 return `<div class="sm-body" id="b_${s.id}">${h}<div class="sm-src"><b>Fuente:</b> ${esc(s.src||a.src)}</div></div>`}
function stepH(a,s){
 const on=!!st.chk[s.id],learn=st.mode==='learn',op=learn&&open.has(s.id),n=`<span class="sm-n">${esc(s.n)}</span>${s.cat&&learn?`<span class="tag">${esc(s.cat)}</span>`:''}`;
 return `<div class="sm-st${on?' on':''}${op?' open':''}" data-id="${s.id}"><div class="sm-row"><input type="checkbox" class="sm-cb" id="cb_${s.id}" ${on?'checked':''} aria-label="Marcar paso: ${esc(s.n)}">`+
 (learn?`<button type="button" class="sm-hd" aria-expanded="${op}" aria-controls="b_${s.id}">${n}<span class="sm-ch">${ic('chev')}</span></button>`:`<label class="sm-hd" for="cb_${s.id}">${n}</label>`)+`</div>${op?bodyH(a,s):''}</div>`}
function phH(a,p){
 const n=p.s.length,c=cnt(p);
 return `<section class="sm-ph" data-ph="${p.id}"><div class="sm-phh"><h2>${esc(p.n)}</h2>`+(n?`<div class="sm-pm"><span class="sm-pc">${c} de ${n} pasos revisados</span><div class="bar"><i style="width:${pct(c,n)}%"></i></div><button type="button" class="sm-mini" data-act="rstph" data-ph="${p.id}"${c?'':' disabled'}>${ic('rst')}Reiniciar fase</button></div>`:`<span class="tag">Pendiente</span>`)+`</div>`+p.s.map(s=>stepH(a,s)).join('')+(p.pend?`<div class="sm-pend">${esc(p.pend)}</div>`:'')+`</section>`}
function body(){
 const a=cur(),all=a.ph.flatMap(p=>p.s),c=all.filter(s=>st.chk[s.id]).length;
 return `<div class="sm-sum"><div><b>${esc(a.n)}</b> · <span class="sm-tc">${c} de ${all.length} pasos revisados</span></div><div class="bar"><i id="sm_tb" style="width:${pct(c,all.length)}%"></i></div>`+
  `<button type="button" class="sm-mini" data-act="rstall"${c?'':' disabled'}>${ic('rst')}Reiniciar checklist</button>`+(st.mode==='learn'?`<button type="button" class="sm-mini" data-act="exp">Expandir todo</button><button type="button" class="sm-mini" data-act="col">Contraer todo</button>`:'')+`</div>`+
  `<p class="sub" style="margin:0 0 4px">${esc(a.note)}</p>`+a.ph.map(p=>phH(a,p)).join('')}
const seg=(act,v,items)=>`<div class="sm-seg" role="group">${items.map(i=>`<button type="button" data-act="${act}" data-v="${i[0]}" aria-pressed="${v===i[0]}">${i[1]}</button>`).join('')}</div>`;
V.sim=function(){return `<h1>Simulador</h1><p class="sub">Checklists interactivos para aprender a operar cada aeronave en Microsoft Flight Simulator 2024.</p><div id="sim" class="${st.mode==='quick'?'sm-quick':''}"><div class="sm-top">${seg('ac',st.ac,DATA.map(a=>[a.id,a.n]))}${seg('mode',st.mode,[['learn','Modo aprendizaje'],['quick','Checklist rápido']])}</div><div id="sm_b">${body()}</div></div><div class="note">${NOTE}</div>`};
function redraw(){const r=$('#sim');if(!r)return;r.className=st.mode==='quick'?'sm-quick':'';r.innerHTML=`<div class="sm-top">${seg('ac',st.ac,DATA.map(a=>[a.id,a.n]))}${seg('mode',st.mode,[['learn','Modo aprendizaje'],['quick','Checklist rápido']])}</div><div id="sm_b">${body()}</div>`}
// Actualiza solo contadores y barras (no reconstruye la lista, así la casilla conserva el foco)
function prog(){const a=cur(),all=a.ph.flatMap(p=>p.s),c=all.filter(s=>st.chk[s.id]).length;
 a.ph.forEach(p=>{const e=$(`[data-ph="${p.id}"]`);if(!e||!p.s.length)return;const k=cnt(p);e.querySelector('.sm-pc').textContent=`${k} de ${p.s.length} pasos revisados`;e.querySelector('.bar i').style.width=pct(k,p.s.length)+'%';e.querySelector('[data-act="rstph"]').disabled=!k});
 $('.sm-tc').textContent=`${c} de ${all.length} pasos revisados`;$('#sm_tb').style.width=pct(c,all.length)+'%';$('[data-act="rstall"]').disabled=!c}
function toggleOpen(id){const e=$(`.sm-st[data-id="${id}"]`),x=BY[id];if(!e)return;open.has(id)?open.delete(id):open.add(id);e.outerHTML=stepH(x.a,x.s);const b=$(`.sm-st[data-id="${id}"] .sm-hd`);if(b)b.focus()}
function reset(list,msg){if(!list.some(s=>st.chk[s.id])||!confirm(msg))return;list.forEach(s=>delete st.chk[s.id]);save();redraw()}
document.addEventListener('click',e=>{
 const hd=e.target.closest('#sim button.sm-hd');if(hd){toggleOpen(hd.closest('.sm-st').dataset.id);return}
 const b=e.target.closest('#sim [data-act]');if(!b)return;const k=b.dataset.act,a=cur();
 if(k==='mode'||k==='ac'){st[k]=b.dataset.v;save();redraw()}
 else if(k==='exp'){a.ph.forEach(p=>p.s.forEach(s=>open.add(s.id)));redraw()}
 else if(k==='col'){a.ph.forEach(p=>p.s.forEach(s=>open.delete(s.id)));redraw()}
 else if(k==='rstph'){const p=a.ph.find(x=>x.id===b.dataset.ph);reset(p.s,`¿Reiniciar la fase «${p.n}»? Se desmarcarán sus pasos.`)}
 else if(k==='rstall')reset(a.ph.flatMap(p=>p.s),`¿Reiniciar todo el checklist del ${a.n}? Se desmarcarán todos sus pasos.`)});
document.addEventListener('change',e=>{const c=e.target.closest('#sim input.sm-cb');if(!c)return;const row=c.closest('.sm-st');st.chk[row.dataset.id]=c.checked?1:0;if(!c.checked)delete st.chk[row.dataset.id];row.classList.toggle('on',c.checked);save();prog()});
})();