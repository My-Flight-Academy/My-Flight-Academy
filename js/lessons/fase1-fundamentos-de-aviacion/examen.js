// Fase 1 — Fundamentos de aviación  ·  EXAMEN DE LA FASE
//
// Cada fase tiene su propio examen. Este archivo lo registra en EXAMS[1] (1 = id de la fase en PHASES).
// Para una fase nueva: crea  js/lessons/faseN-.../examen.js  con  EXAMS[N]=[ ...preguntas... ];
// y agrega su ruta a la lista FILES de js/lessons/loader.js.
// El Dashboard, la página de Exámenes y el historial se adaptan solos: no hay que tocar app.js.
//
// Formato de cada pregunta:
//   p: enunciado · o: opciones (2 para verdadero/falso, 4 para opción múltiple)
//   a: índice de la opción correcta (empieza en 0) · e: explicación · t: título EXACTO del tema (de PHASES)
EXAMS[1]=[
 // — Partes del avión —
 {t:'Partes del avión',p:'Según la división general que usa la FAA, ¿cuál de estos NO es uno de los cinco grandes grupos de un avión convencional?',o:['Fuselaje','Empenaje','Planta motriz','Sistema de navegación GPS'],a:3,e:'Los cinco grupos son fuselaje, alas, empenaje, tren de aterrizaje y planta motriz.'},
 {t:'Partes del avión',p:'¿Qué componentes forman el empenaje?',o:['Alerones y flaps','Motor y hélice','Estabilizador horizontal, elevator, estabilizador vertical y rudder','Tren principal y tren de nariz'],a:2,e:'El empenaje es el conjunto de la cola: superficies fijas (estabilizadores) y móviles (elevator y rudder).'},
 {t:'Partes del avión',p:'Verdadero o falso: los alerones se ubican normalmente en la parte exterior del borde de salida de las alas.',o:['Verdadero','Falso'],a:0,e:'Los alerones están en la parte exterior del borde de salida; los flaps, hacia la parte interior.'},
 // — Controles de vuelo —
 {t:'Controles de vuelo',p:'¿Qué superficie controla principalmente el yaw?',o:['Ailerons','Rudder','Elevator','Spoilers'],a:1,e:'El rudder, accionado con los pedales, controla la guiñada alrededor del eje vertical.'},
 {t:'Controles de vuelo',p:'¿Qué puede provocar el adverse yaw al usar los alerones?',o:['La falta de combustible','El uso del trim','Extender los flaps','La diferencia de resistencia entre las alas'],a:3,e:'El ala que gana sustentación también genera más resistencia, y eso produce una guiñada contraria al viraje.'},
 {t:'Controles de vuelo',p:'¿Cuál de estos es un control primario de vuelo?',o:['Flap','Slat','Trim','Elevator'],a:3,e:'Los controles primarios son ailerons, elevator y rudder.'},
 // — Pitch, Roll y Yaw —
 {t:'Pitch, Roll y Yaw',p:'¿Alrededor de qué eje ocurre el roll?',o:['Lateral','Vertical','Longitudinal','Ninguno de los tres ejes'],a:2,e:'El roll es la rotación alrededor del eje longitudinal, de la nariz a la cola.'},
 {t:'Pitch, Roll y Yaw',p:'Si el piloto mueve el yoke hacia atrás, ¿qué tiende a ocurrir normalmente?',o:['Roll a la derecha','La nariz sube (pitch up)','Yaw a la izquierda','Se extienden los flaps'],a:1,e:'El elevator hace que la nariz tienda a subir. La respuesta exacta depende del avión.'},
 {t:'Pitch, Roll y Yaw',p:'¿Qué afirmación sobre el pitch es correcta?',o:['Pitch y altitud significan lo mismo','Pitch es la inclinación de las alas','Pitch describe la orientación de la nariz respecto al horizonte','Pitch solo existe en aviones con hélice'],a:2,e:'El pitch es la actitud de la nariz; la altitud es la posición vertical. No son lo mismo.'},
 // — Flaps y Trim —
 {t:'Flaps y Trim',p:'¿Qué ocurre generalmente al extender los flaps?',o:['Disminuyen la sustentación y la resistencia','Solo aumenta la velocidad','Se pierde el control del pitch','Aumentan la sustentación y la resistencia'],a:3,e:'Los flaps modifican el ala: más sustentación y también más resistencia.'},
 {t:'Flaps y Trim',p:'¿Qué significa VFE?',o:['Velocidad de pérdida','Velocidad máxima con una configuración de flaps extendidos','Velocidad de rotación','Velocidad máxima de crucero'],a:1,e:'VFE es la Maximum Flap Extended Speed. Su valor depende de cada avión.'},
 {t:'Flaps y Trim',p:'Verdadero o falso: el trim reemplaza al elevator como control del pitch.',o:['Verdadero','Falso'],a:1,e:'El elevator sigue siendo el control primario; el trim solo reduce la fuerza que el piloto debe mantener.'},
 // — Cuatro fuerzas del vuelo —
 {t:'Cuatro fuerzas del vuelo',p:'En vuelo recto y nivelado estabilizado, ¿qué relación es aproximadamente correcta?',o:['Lift ≈ Weight y Thrust ≈ Drag','Lift ≈ Drag y Thrust ≈ Weight','Lift = 0 y Drag = 0','Thrust = 0 y Weight = 0'],a:0,e:'La sustentación equilibra al peso, y el empuje a la resistencia.'},
 {t:'Cuatro fuerzas del vuelo',p:'¿Qué tipo de resistencia está asociada a la generación de sustentación?',o:['Parasite drag','Ground drag','Induced drag','Engine drag'],a:2,e:'La resistencia inducida aparece al producir sustentación y es mayor a baja velocidad.'},
 {t:'Cuatro fuerzas del vuelo',p:'¿Qué puede ocurrir si se supera el ángulo de ataque crítico?',o:['Aumenta automáticamente el empuje','El ala entra en pérdida (stall)','Desaparece el peso','El avión entra en crucero'],a:1,e:'Al superar el ángulo crítico, el ala puede entrar en pérdida.'}
];