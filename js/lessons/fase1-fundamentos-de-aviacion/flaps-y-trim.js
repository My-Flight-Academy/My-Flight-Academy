// Fase 1 — Fundamentos de aviación  ·  Lección: Flaps y Trim
//
// IMÁGENES: guárdalas en  images/fase1-fundamentos-de-aviacion/flaps-y-trim/
// y escribe abajo solo el nombre con su extensión (por ejemplo 'aircraft-flaps-es.svg').
// Mientras un nombre esté vacío (''), la lección muestra un marcador de "imagen pendiente".
// CRÉDITOS: si una imagen exige atribución (por ejemplo CC BY-SA), complétala en el
// tercer parámetro de fig(): autor y licencia, como figuran en la página del archivo.
{
 const IMG={
  flapsEs:'Aircraft_flaps-es.svg.webp',  // Flaps de aeronave, en español (imagen principal)
  flaps:'flaps.jpg',    // Flaps de aeronave, vista general
  plain:'Plain_flap_diagram.svg.webp',    // Diagrama de flap simple (plain flap)
  slotted:'Slot_flap_diagram.svg.webp',  // Diagrama de flap ranurado (slotted flap)
  trim:'trim_example.jpg'      // Ejemplo de sistema de trim (Airplane Flying Handbook, Trim Control)
 };

 LESSONS['Flaps y Trim']={lvl:'Básico',min:10,svg:false,body:`
<h3>1. Introducción</h3>
<p>Los flaps y el trim no son controles primarios de vuelo como los alerones, el elevator y el rudder. Forman parte de los <b>sistemas secundarios de control</b>. La FAA clasifica dentro de ellos los flaps, los dispositivos de borde de ataque, los spoilers y los sistemas de trim.</p>
<ul>
<li><b>Flaps:</b> modifican las características aerodinámicas del ala, especialmente la sustentación y la resistencia.</li>
<li><b>Trim:</b> ayuda al piloto a reducir la fuerza que debe mantener sobre los controles para conservar una determinada condición de vuelo.</li></ul>

<h3>2. ¿Qué son los flaps?</h3>
<p>Son superficies móviles ubicadas normalmente en el borde de salida del ala, principalmente hacia la parte interior. Cuando se extienden, cambian la forma y las características aerodinámicas del ala. Su objetivo principal es permitir que el avión genere más sustentación a velocidades relativamente bajas, aunque también aumentan la resistencia.</p>
<div class="key"><span class="mono">Flaps extendidos → más sustentación + más resistencia</span><br>Es especialmente útil durante el despegue, la aproximación y el aterrizaje.</div>
${fig(IMG.flapsEs,'Flaps de aeronave y sus diferentes configuraciones')}

<h3>3. ¿Por qué se utilizan los flaps?</h3>
<p>Un avión necesita generar suficiente sustentación para mantenerse en el aire. Durante el aterrizaje queremos volar a una velocidad relativamente baja, pero reducirla demasiado puede acercar al avión a la pérdida. Los flaps permiten modificar el ala para producir más sustentación a velocidades más bajas.</p>
<div class="key"><span class="mono">Flaps → permiten operar a velocidades menores durante determinadas fases del vuelo.</span><br>Efecto secundario: más flaps, más resistencia.</div>
${fig(IMG.flaps,'Flaps de aeronave, vista general')}

<h3>4. Flaps durante el despegue</h3>
<p>En muchos aviones se usa una configuración parcial de flaps durante el despegue. Puede dar beneficios de sustentación y permitir despegar a una velocidad menor. Pero no existe una configuración universal. La cantidad de flaps depende de:</p>
<ul><li>Tipo de avión y peso.</li><li>Longitud de pista.</li><li>Temperatura, altitud, elevación del aeropuerto y viento.</li><li>Procedimientos del fabricante.</li></ul>
<p>Por eso, en un avión real siempre se debe utilizar el POH/AFM y los procedimientos del avión específico.</p>

<h3>5. Flaps durante la aproximación y el aterrizaje</h3>
<p>Durante la aproximación se pueden extender progresivamente los flaps según el procedimiento del avión. Esto permite aumentar la sustentación y la resistencia, reducir la velocidad de aproximación según la configuración establecida y facilitar el descenso y la preparación para el aterrizaje. Una configuración con más flaps normalmente produce más resistencia, lo que puede ayudar a controlar la trayectoria de descenso.</p>

<h3>6. ¿Qué ocurre cuando extendemos los flaps?</h3>
<div class="key"><span class="mono">Flaps extendidos → cambia la geometría del ala → mayor capacidad de generar sustentación + mayor resistencia</span></div>
<p>Más flaps no significa simplemente "más sustentación para siempre". Existe un límite de velocidad y una configuración máxima determinada por cada avión.</p>

<h3>7. Velocidad máxima de los flaps</h3>
<p>Los aviones tienen velocidades máximas asociadas a determinadas configuraciones de flaps. En muchos aparece la velocidad <b>VFE</b>.</p>
<div class="key"><span class="mono">VFE = Maximum Flap Extended Speed</span><br>La velocidad máxima a la que se puede mantener una determinada configuración de flaps. La velocidad exacta depende del avión: nunca asumas que todos usan las mismas.</div>

<h3>8. Tipos de flaps</h3>
<p>Existen diferentes diseños. Algunos ejemplos:</p>
<ul>
<li><b>Plain flap (flap simple):</b> uno de los diseños más sencillos. Una parte del borde de salida gira hacia abajo.</li>
<li><b>Slotted flap (flap ranurado):</b> tiene una abertura que permite el paso de aire entre el ala y el flap.</li>
<li><b>Fowler flap:</b> además de cambiar el ángulo, se desplaza hacia atrás, aumentando el área efectiva y la curvatura del ala. Es una solución común en aviones de transporte.</li></ul>
${fig(IMG.plain,'Diagrama de un flap simple (plain flap)')}
${fig(IMG.slotted,'Diagrama de un flap ranurado (slotted flap)')}

<h3>9. Flaps y velocidad</h3>
<p>Los flaps no son simplemente "para ir lento": cambian las características aerodinámicas del avión. Por eso se utilizan en fases específicas y respetando las velocidades máximas establecidas.</p>
<div class="wrap"><table><tr><th>FASE (EJEMPLO CONCEPTUAL)</th><th>FLAPS</th><th>EFECTO</th></tr>
<tr><td>Crucero</td><td>Retraídos</td><td>Menor resistencia</td></tr>
<tr><td>Aproximación</td><td>Parcialmente extendidos</td><td>Más sustentación y más resistencia</td></tr>
<tr><td>Aterrizaje</td><td>Configuración establecida para el avión</td><td>Mayor sustentación y mayor resistencia</td></tr></table></div>

<h3>10. ¿Qué es el trim?</h3>
<p>Es un sistema que permite reducir la fuerza que el piloto necesita ejercer continuamente sobre los controles. Imagina que debes mantener presión hacia atrás sobre el yoke para conservar una actitud. En lugar de sostener esa fuerza durante todo el vuelo, puedes usar el trim para equilibrar el avión. La FAA lo describe como un sistema destinado a aliviar al piloto de mantener una presión constante sobre los controles.</p>

<h3>11. El trim no controla el avión por ti</h3>
<div class="key"><b>El trim no sustituye al elevator.</b> El elevator sigue siendo el control primario del pitch; el trim solo ayuda a reducir la fuerza necesaria para mantener esa condición.<br><span class="mono">ELEVATOR → controla directamente el Pitch<br>TRIM → reduce la fuerza necesaria para mantener la condición</span></div>

<h3>12. Elevator trim</h3>
<p>En muchos aviones ligeros existe un sistema de elevator trim. Normalmente está conectado al sistema del elevator y permite establecer una condición en la que el piloto no tenga que ejercer presión constante sobre el control. La FAA señala que es especialmente común en aviones ligeros.</p>
${fig(IMG.trim,'Ejemplo de sistema de trim','Fuente: FAA, Airplane Flying Handbook')}

<h3>13. Ejemplo de trim nose-up</h3>
<p>Supón que el piloto necesita mantener constantemente presión hacia atrás sobre el control. Eso indica que hace falta una condición de <i>nose-up trim</i>. El piloto ajusta el trim progresivamente hasta que la presión necesaria disminuye.</p>
<div class="key"><span class="mono">Ajustar actitud y configuración → aplicar trim → reducir la presión sobre el control</span></div>

<h3>14. ¿Cuándo se utiliza el trim?</h3>
<p>Puede utilizarse después de cambios en la velocidad, la potencia, la configuración, la actitud, los flaps o el régimen de vuelo. Una secuencia típica:</p>
<ol><li>Un cambio de potencia modifica la actitud o la tendencia del avión.</li><li>El piloto corrige con los controles.</li><li>Ajusta el trim.</li><li>Se reduce la fuerza necesaria.</li></ol>
<p>La FAA recomienda establecer primero la potencia, la actitud y la configuración deseadas, y después ajustar el trim para aliviar la presión sobre los controles.</p>

<h3>15. Trim y flaps trabajan juntos, de forma indirecta</h3>
<p>Los flaps pueden modificar considerablemente las características del avión. Al cambiar la configuración pueden variar la sustentación, la resistencia, la actitud y las fuerzas sobre los controles. Por eso, después de un cambio de flaps puede ser necesario reajustar el trim. Esto no significa que sean el mismo sistema: son sistemas diferentes que afectan la forma en que el avión se comporta.</p>

<h3>16. El trim en Microsoft Flight Simulator</h3>
<p>En una Cessna 172 de MSFS, el elevator controla el pitch y el elevator trim ayuda a mantener esa condición sin tener que sostener tanta presión sobre el yoke. Un ejercicio sencillo:</p>
<ol><li>Establece vuelo recto y nivelado.</li><li>Mantén una actitud determinada.</li><li>Observa la presión que necesitas aplicar al yoke.</li><li>Ajusta lentamente el trim.</li><li>Reduce progresivamente la presión sobre el yoke.</li><li>Comprueba que el avión mantiene aproximadamente la actitud deseada.</li><li>Si cambia la velocidad o la potencia, vuelve a ajustar.</li></ol>
<p>Objetivo: entender que el trim no reemplaza el control de pitch.</p>
<div class="note">Los procedimientos y el comportamiento de un simulador pueden simplificar los del avión real. En un avión real, sigue siempre el POH/AFM y la instrucción de un instructor de vuelo.</div>

<h3>17. Error común: usar el trim para cambiar la actitud</h3>
<div class="key"><b>"Quiero levantar la nariz, entonces uso trim nose-up."</b> No es la forma correcta de pensar el procedimiento.<br><span class="mono">1. Elevator → establece la actitud deseada.<br>2. Trim → elimina la presión necesaria para mantenerla.</span></div>

<h3>18. Flaps frente a trim</h3>
<div class="wrap"><table><tr><th>CARACTERÍSTICA</th><th>FLAPS</th><th>TRIM</th></tr>
<tr><td>Función principal</td><td>Modificar características aerodinámicas</td><td>Reducir fuerzas sobre los controles</td></tr>
<tr><td>Actúa principalmente sobre</td><td>Sustentación y resistencia</td><td>Fuerzas de control</td></tr>
<tr><td>¿Es control primario?</td><td>No</td><td>No</td></tr>
<tr><td>Uso típico</td><td>Despegue, aproximación y aterrizaje</td><td>Mantener una condición de vuelo</td></tr>
<tr><td>¿Reemplaza al elevator?</td><td>No</td><td>No</td></tr>
<tr><td>¿Puede afectar el comportamiento del avión?</td><td>Sí</td><td>Sí</td></tr>
<tr><td>¿Se usa continuamente?</td><td>Depende de la fase</td><td>Puede reajustarse según la condición</td></tr></table></div>

<h3>Lo que debes recordar</h3>
<div class="sum">
<div><b class="mono">FLAPS = CONFIGURACIÓN</b><br>Cambian la configuración del ala. Aumentan la sustentación y también la resistencia. Se usan sobre todo en fases de baja velocidad. Respeta siempre las velocidades y configuraciones del avión.</div>
<div><b class="mono">TRIM = EQUILIBRIO</b><br>Reduce la fuerza que el piloto debe mantener sobre los controles y ayuda a conservar una condición de vuelo.</div>
<div><b class="mono">NO SON PRIMARIOS</b><br>El trim no es un control primario ni sustituye al elevator.</div></div>
<div class="note">Fuente técnica principal: FAA, <i>Pilot's Handbook of Aeronautical Knowledge</i>, capítulo 6, donde se explican los sistemas secundarios, los flaps y el trim. Para el trim en la práctica, el <i>Airplane Flying Handbook</i> de la FAA. Es material de estudio general; los detalles dependen de cada avión y de su manual.</div>`,
 q:[
 {p:'¿Cuál es la función principal de los flaps?',o:['Controlar el yaw','Aumentar la potencia del motor','Modificar las características aerodinámicas del ala','Controlar directamente el roll'],a:2,e:'Los flaps modifican las características aerodinámicas del ala, sobre todo la sustentación y la resistencia.'},
 {p:'¿Qué ocurre generalmente cuando se extienden los flaps?',o:['Disminuyen sustentación y resistencia','Aumentan sustentación y resistencia','Solo aumenta la velocidad','El avión deja de necesitar elevator'],a:1,e:'Más flaps normalmente significa más sustentación y también más resistencia.'},
 {p:'¿Qué es el trim?',o:['Un control primario','Un sistema para reducir fuerzas constantes sobre los controles','Un tipo de flap','Un sistema de navegación'],a:1,e:'El trim alivia al piloto de mantener presión constante sobre los controles.'},
 {p:'¿El trim reemplaza al elevator?',o:['Sí','Solo durante el aterrizaje','No','Solo en aviones pequeños'],a:2,e:'El elevator sigue siendo el control primario del pitch; el trim solo reduce la fuerza necesaria.'},
 {p:'¿Qué significa VFE?',o:['Velocidad de pérdida','Velocidad máxima con una configuración de flaps extendidos','Velocidad de rotación','Velocidad de crucero'],a:1,e:'VFE es la Maximum Flap Extended Speed. Su valor depende de cada avión.'},
 {p:'¿Qué debe hacer normalmente el piloto antes de trimar?',o:['Establecer la condición de vuelo deseada','Apagar el motor','Extender todos los flaps','Activar el piloto automático'],a:0,e:'Primero se establecen potencia, actitud y configuración; después se usa el trim para aliviar la presión.'},
 {p:'¿Los flaps son controles primarios?',o:['Sí','No','Solo en Airbus','Solo en Boeing'],a:1,e:'Los controles primarios son ailerons, elevator y rudder. Los flaps son un sistema secundario.'},
 {p:'¿Cuál es la relación correcta?',o:['Flaps → yaw','Trim → potencia','Flaps → sustentación/resistencia','Trim → navegación'],a:2,e:'Los flaps actúan sobre la sustentación y la resistencia; el trim, sobre las fuerzas de control.'}]};
}