// Fase 1 — Fundamentos de aviación  ·  Lección: Cuatro fuerzas del vuelo
//
// Esta lección NO incrusta imágenes externas: los dos diagramas (las cuatro fuerzas y la curva
// de resistencia) son SVG propios dentro del texto. Al final incluye enlaces de referencia
// (NASA y FAA) para consultar en su sitio original.
// Si quieres añadir una imagen tuya, guárdala en
//   images/fase1-fundamentos-de-aviacion/cuatro-fuerzas-del-vuelo/
// y usa  ${fig('nombre.png','Descripción','Crédito')}  dentro del texto de la lección.
{
 LESSONS['Cuatro fuerzas del vuelo']={lvl:'Básico',min:12,svg:false,body:`
<h3>1. Introducción</h3>
<p>Para que un avión pueda volar, sobre él actúan constantemente diferentes fuerzas. Las cuatro fundamentales son:</p>
<ul><li><b>Lift</b> — Sustentación</li><li><b>Weight</b> — Peso</li><li><b>Thrust</b> — Empuje</li><li><b>Drag</b> — Resistencia</li></ul>
<p>Estas fuerzas actúan en diferentes direcciones y determinan cómo se mueve el avión.</p>
<svg viewBox="0 0 360 250" role="img" aria-label="Diagrama de las cuatro fuerzas: lift hacia arriba, weight hacia abajo, thrust hacia adelante y drag hacia atrás" style="width:100%;max-width:400px;display:block;margin:14px auto" fill="none" stroke-linecap="round">
<path d="M130 125h100M180 118l-30 7 30 7M150 125l-14-14M150 125l-14 14M222 125l8-10" style="stroke:var(--mu)" stroke-width="3"/>
<g style="stroke:var(--bl)" stroke-width="3"><path d="M180 108V36M170 48l10-12 10 12"/><path d="M180 142v72M170 202l10 12 10-12"/></g>
<g style="stroke:var(--am)" stroke-width="3"><path d="M236 125h84M308 115l12 10-12 10"/><path d="M124 125H40M52 115l-12 10 12 10"/></g>
<g style="fill:var(--tx);font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600" stroke="none">
<text x="180" y="26" text-anchor="middle">LIFT</text><text x="180" y="238" text-anchor="middle">WEIGHT</text><text x="322" y="108" text-anchor="end">THRUST</text><text x="38" y="108">DRAG</text></g></svg>
<div class="key"><b>En vuelo recto y nivelado</b>, de forma simplificada:<br><span class="mono">Lift ≈ Weight<br>Thrust ≈ Drag</span><br>Durante un ascenso, descenso, aceleración, desaceleración o maniobra, estas relaciones pueden cambiar.</div>

<h3>2. Las cuatro fuerzas</h3>
<div class="wrap"><table><tr><th>FUERZA</th><th>EN ESPAÑOL</th><th>DIRECCIÓN GENERAL</th><th>FUNCIÓN</th></tr>
<tr><td class="mono">Lift</td><td>Sustentación</td><td>Hacia arriba</td><td>Se opone al peso</td></tr>
<tr><td class="mono">Weight</td><td>Peso</td><td>Hacia abajo</td><td>Gravedad sobre el avión</td></tr>
<tr><td class="mono">Thrust</td><td>Empuje</td><td>Hacia adelante</td><td>Impulsa el avión</td></tr>
<tr><td class="mono">Drag</td><td>Resistencia</td><td>Hacia atrás</td><td>Se opone al movimiento</td></tr></table></div>
<div class="key"><b>La regla más importante</b><br><span class="mono">Lift se opone al Weight.<br>Thrust se opone al Drag.</span></div>

<h3>3. Lift — Sustentación</h3>
<p>Es la fuerza aerodinámica que actúa sobre el avión y que, en muchas condiciones de vuelo, tiene una componente dirigida hacia arriba. En vuelo normal ayuda a mantener al avión en el aire. Está relacionada con la velocidad del aire, la densidad del aire, el área alar, la forma del ala, el ángulo de ataque y la configuración del avión.</p>
<p><b>¿De dónde viene?</b> Cuando el avión se mueve a través del aire, el flujo de aire interactúa con las alas. El ala está diseñada para producir una fuerza aerodinámica que, según las condiciones, tiene una componente importante hacia arriba.</p>
<div class="key"><b>Importante.</b> La sustentación no es simplemente "el aire empujando el avión hacia arriba": es el resultado de la interacción aerodinámica entre el ala y el flujo de aire.</div>

<h3>4. Factores que afectan la sustentación</h3>
<p>Una forma básica de entenderlo es mediante la ecuación:</p>
<div class="key"><span class="mono">L = ½ · ρ · V² · S · CL</span><br>L = sustentación · ρ = densidad del aire · V = velocidad · S = superficie alar · CL = coeficiente de sustentación</div>
<p>No necesitas memorizar todavía la fórmula. Lo importante es entender que la sustentación depende de varias variables. Por ejemplo, si aumenta la velocidad, manteniendo las demás condiciones aproximadamente iguales, la sustentación disponible puede aumentar significativamente. Por eso la velocidad es tan importante durante el vuelo.</p>

<h3>5. Weight — Peso</h3>
<p>Es la fuerza producida por la gravedad sobre el avión y actúa aproximadamente hacia el centro de la Tierra. Depende principalmente de la masa del avión y de la gravedad. Incluye el peso de la estructura, el combustible, el piloto, los pasajeros, el equipaje, los equipos y otros elementos a bordo. A medida que se consume combustible, la masa y, por tanto, el peso del avión disminuyen.</p>

<h3>6. Lift frente a Weight</h3>
<p>Estas dos fuerzas tienen una relación fundamental.</p>
<ul>
<li>Si están aproximadamente equilibradas, el avión puede mantener un vuelo aproximadamente nivelado, si las demás condiciones también son adecuadas.</li>
<li>Si la sustentación vertical es insuficiente respecto al peso, el avión tenderá a perder altura.</li>
<li>Si existe una componente vertical de fuerza suficiente para superar el peso, el avión puede ascender.</li></ul>
<div class="key"><b>Una precisión importante.</b> Ascender no significa simplemente "tener más Lift que Weight" en todos los casos. En un ascenso las fuerzas pueden estar inclinadas respecto al avión, y una componente del empuje contribuye al movimiento contra el peso. Esto se estudiará con más profundidad más adelante.</div>

<h3>7. Thrust — Empuje</h3>
<p>Es la fuerza que proporciona el sistema de propulsión para impulsar el avión. Según el avión puede provenir de una hélice, un motor a reacción, un turbofán, un turbohélice u otros sistemas.</p>
<ul><li><b>Avión con hélice:</b> el motor hace girar la hélice y la hélice produce el empuje.</li><li><b>Avión a reacción:</b> el motor acelera el flujo de aire y esto produce el empuje.</li></ul>
<p>El empuje permite al avión vencer la resistencia y mantener o aumentar su velocidad, dependiendo de las condiciones.</p>

<h3>8. Drag — Resistencia</h3>
<p>Es una fuerza aerodinámica que se opone al movimiento del avión a través del aire. Si el avión se mueve hacia adelante, la resistencia actúa en sentido contrario al movimiento, por eso normalmente se representa hacia atrás.</p>

<h3>9. Tipos principales de resistencia</h3>
<p>Para esta primera lección basta con conocer dos grandes categorías:</p>
<ul>
<li><b>Parasite drag (resistencia parásita):</b> asociada al movimiento del avión a través del aire y a los elementos que generan resistencia por su forma o configuración. Incluye la resistencia de forma, de interferencia y de fricción. En general, aumenta rápidamente con la velocidad.</li>
<li><b>Induced drag (resistencia inducida):</b> asociada a la generación de sustentación por el ala. A baja velocidad tiende a ser mayor; a alta velocidad, menor.</li></ul>

<h3>10. La curva de resistencia</h3>
<p>De esto surge una relación muy importante. A velocidades bajas domina la resistencia inducida; a velocidades altas, la parásita. Entre ambos extremos existe una zona donde la resistencia total puede ser mínima.</p>
<svg viewBox="0 0 360 240" role="img" aria-label="Esquema de la resistencia total como suma de la resistencia inducida y la parásita en función de la velocidad" style="width:100%;max-width:420px;display:block;margin:14px auto" fill="none" stroke-linecap="round">
<path d="M40 20v185h300" style="stroke:var(--mu)" stroke-width="2"/>
<path d="M44 38C70 150 150 188 330 196" style="stroke:var(--bl)" stroke-width="2.5"/>
<path d="M44 198C170 196 270 170 330 40" style="stroke:var(--gr)" stroke-width="2.5"/>
<path d="M44 30C110 190 230 190 330 30" style="stroke:var(--am)" stroke-width="3.5"/>
<g style="fill:var(--tx);font-family:'JetBrains Mono',monospace;font-size:11px" stroke="none">
<text x="50" y="60" style="fill:var(--bl)">Inducida</text><text x="270" y="86" style="fill:var(--gr)">Parásita</text><text x="130" y="140" style="fill:var(--am)">Total</text>
<text x="10" y="14" style="fill:var(--mu)">Resistencia</text><text x="292" y="226" style="fill:var(--mu)">Velocidad</text></g></svg>
<div class="note">Esquema simplificado y sin escala, solo para ver la forma de la relación. Se retomará al estudiar las velocidades de vuelo y la eficiencia.</div>

<h3>11. Thrust frente a Drag</h3>
<p>Estas dos fuerzas trabajan en direcciones opuestas.</p>
<ul>
<li><b>Thrust ≈ Drag:</b> el avión puede mantener una velocidad aproximadamente constante, si las demás condiciones permanecen estables.</li>
<li><b>Thrust &gt; Drag:</b> hay un exceso de empuje que puede usarse para acelerar o, según la trayectoria y la configuración, para superar otras fuerzas.</li>
<li><b>Thrust &lt; Drag:</b> el avión tenderá a desacelerar si no cambia la condición de vuelo.</li></ul>

<h3>12. Las cuatro fuerzas juntas</h3>
<p>Esta es la imagen mental que debes tener cada vez que pienses en un avión volando: sustentación hacia arriba, peso hacia abajo, empuje hacia adelante y resistencia hacia atrás, como en el diagrama del inicio.</p>

<h3>13. Vuelo recto y nivelado</h3>
<p>En un vuelo recto y nivelado estabilizado podemos usar una aproximación sencilla: <span class="mono">Lift ≈ Weight</span> y <span class="mono">Thrust ≈ Drag</span>. Las fuerzas están aproximadamente equilibradas: el avión no necesita estar acelerando verticalmente ni horizontalmente.</p>

<h3>14. ¿Qué ocurre al acelerar?</h3>
<p>Si el avión aumenta la potencia, inicialmente <span class="mono">Thrust &gt; Drag</span>: hay un exceso de empuje y el avión puede comenzar a acelerar. A medida que aumenta la velocidad, también puede aumentar la resistencia. Finalmente se puede llegar a una nueva condición donde <span class="mono">Thrust ≈ Drag</span> y el avión deja de acelerar.</p>

<h3>15. ¿Qué ocurre al reducir potencia?</h3>
<p>Si se reduce la potencia, el empuje baja y la resistencia puede superar temporalmente al empuje (<span class="mono">Drag &gt; Thrust</span>). El avión comienza a desacelerar, según la actitud y la configuración. La potencia y la velocidad están relacionadas, pero el avión no cambia de velocidad instantáneamente.</p>

<h3>16. ¿Qué ocurre durante un descenso?</h3>
<p>Durante un descenso la trayectoria tiene una componente hacia abajo. Las cuatro fuerzas siguen existiendo, pero cambian su relación y sus componentes. En un descenso estabilizado puede darse <span class="mono">Thrust &lt; Drag</span>, y la componente del peso a lo largo de la trayectoria contribuye al movimiento hacia adelante.</p>
<div class="key">No pienses que "si reduzco potencia, el avión simplemente cae". El avión sigue siendo aerodinámicamente controlable y las cuatro fuerzas siguen actuando.</div>

<h3>17. ¿Qué ocurre durante un ascenso?</h3>
<p>En un ascenso la trayectoria tiene una componente hacia arriba. El avión necesita energía suficiente para vencer la resistencia y para aumentar o mantener su energía potencial. Según el tipo de avión y el régimen de ascenso, el empuje tiene un papel fundamental.</p>
<div class="key"><span class="mono">Potencia disponible → vencer la resistencia + permitir el ascenso</span><br>Más adelante se conectará con el <i>rate of climb</i> (régimen de ascenso).</div>

<h3>18. ¿Y qué pasa en un viraje?</h3>
<p>Cuando el avión hace roll, la sustentación se inclina. En lugar de actuar completamente hacia arriba, parte de ella actúa hacia el interior del viraje, y esto permite cambiar la trayectoria.</p>
<div class="key"><span class="mono">Roll → inclina el vector de sustentación → permite el viraje</span><br>Esto conecta directamente con la lección de Pitch, Roll y Yaw.</div>

<h3>19. Ángulo de ataque y sustentación</h3>
<p>El <b>ángulo de ataque (Angle of Attack, AOA)</b> es el ángulo entre la cuerda aerodinámica del ala y el flujo de aire relativo. Influye de forma importante en la sustentación: aumentarlo puede aumentar la sustentación hasta alcanzar un punto crítico. Si se supera ese ángulo crítico, el ala puede entrar en pérdida (<i>stall</i>). Será tema de una lección posterior.</p>
<div class="key"><span class="mono">Ángulo de ataque → sustentación → posible pérdida si se supera el ángulo crítico</span></div>

<h3>20. Relación con los controles de vuelo</h3>
<p>Aquí se conectan todas las lecciones anteriores:</p>
<div class="wrap"><table><tr><th>ACCIÓN</th><th>PRINCIPAL EFECTO</th></tr>
<tr><td class="mono">Elevator</td><td>Cambia el pitch y puede modificar el ángulo de ataque</td></tr>
<tr><td class="mono">Ailerons</td><td>Producen roll</td></tr>
<tr><td class="mono">Rudder</td><td>Controla principalmente el yaw</td></tr>
<tr><td class="mono">Flaps</td><td>Cambian la sustentación y la resistencia</td></tr>
<tr><td class="mono">Throttle</td><td>Controla la potencia y el empuje disponible</td></tr>
<tr><td class="mono">Trim</td><td>Reduce las fuerzas sobre los controles</td></tr></table></div>
<p>Así se empieza a comprender que ningún control funciona completamente aislado.</p>

<h3>21. Ejemplo con una Cessna 172</h3>
<p>Imagina una Cessna 172 en vuelo recto y nivelado: <span class="mono">Lift ≈ Weight</span> y <span class="mono">Thrust ≈ Drag</span>. Aumentas la potencia, <span class="mono">Thrust ↑</span>, y el avión empieza a acelerar. Después se establece una nueva condición en la que <span class="mono">Thrust ≈ Drag</span>, pero a una velocidad mayor. Si luego reduces la potencia, el avión comenzará a desacelerar o cambiará su trayectoria, según la actitud y la configuración.</p>

<h3>22. Ejercicios prácticos en MSFS</h3>
<p><b>Ejercicio 1 — Identificar las fuerzas.</b> En una Cessna 172, en vuelo recto, observa la velocidad, la altitud, la actitud y la potencia. Piensa: ¿qué fuerza mantiene al avión frente a la gravedad? Lift. ¿Qué fuerza lo atrae hacia la Tierra? Weight. ¿Cuál lo impulsa hacia adelante? Thrust. ¿Cuál se opone al movimiento? Drag.</p>
<p><b>Ejercicio 2 — Aumentar potencia.</b> Estabiliza el avión, aumenta progresivamente la potencia, observa la velocidad y cómo cambia el comportamiento del avión, y vuelve a estabilizarlo. Objetivo: observar la relación entre Thrust y Drag.</p>
<p><b>Ejercicio 3 — Configuración de flaps.</b> Estabiliza el avión, reduce la velocidad dentro de los límites apropiados del avión, selecciona una configuración de flaps permitida y observa cómo cambian la velocidad y el comportamiento. Objetivo: conectar la lección de Flaps con Lift y Drag.</p>
<div class="note">El simulador simplifica el comportamiento de la aeronave real. En un avión real, estos ejercicios se hacen con un instructor de vuelo y siguiendo el POH/AFM.</div>

<h3>23. Errores comunes</h3>
<ul>
<li><b>"Lift siempre apunta exactamente hacia arriba".</b> No necesariamente. La fuerza aerodinámica puede orientarse de distintas maneras según la situación; en un vuelo básico se representa normalmente hacia arriba.</li>
<li><b>"Thrust siempre hace que el avión suba".</b> No. El empuje proporciona una fuerza propulsiva; se usa para mantener velocidad, acelerar, ascender, etc., según la condición de vuelo.</li>
<li><b>"Si hay más Lift que Weight, siempre estoy subiendo".</b> No necesariamente. El movimiento depende de la resultante de las fuerzas y de la trayectoria.</li>
<li><b>"Drag es algo malo".</b> No. La resistencia es una parte natural de la aerodinámica, y los pilotos la usan de diferentes formas, especialmente en aproximaciones y aterrizajes.</li>
<li><b>"Los flaps solamente producen sustentación".</b> No. Al extenderse generalmente producen más sustentación y más resistencia.</li></ul>

<h3>Lo que debes recordar</h3>
<div class="sum">
<div><b class="mono">LIFT</b><br>Sustentación. Mantiene al avión en el aire y se opone principalmente al peso.</div>
<div><b class="mono">WEIGHT</b><br>Peso. La fuerza de la gravedad sobre el avión.</div>
<div><b class="mono">THRUST</b><br>Empuje. Proporciona la fuerza propulsiva.</div>
<div><b class="mono">DRAG</b><br>Resistencia. Se opone al movimiento a través del aire.</div></div>
<div class="key"><b>Reglas para memorizar</b><br><span class="mono">LIFT = ARRIBA · WEIGHT = ABAJO · THRUST = ADELANTE · DRAG = ATRÁS<br>LIFT ↔ WEIGHT · THRUST ↔ DRAG</span></div>

<h3>Referencias</h3>
<p>Para ampliar, consulta estas fuentes en su sitio original:</p>
<ul>
<li><a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/four-forces-on-an-airplane/" target="_blank" rel="noopener" style="color:var(--am)">Four Forces on an Airplane — NASA Glenn Research Center</a></li>
<li><a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/lift/" target="_blank" rel="noopener" style="color:var(--am)">Lift — NASA Glenn Research Center</a></li>
<li><a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/drag/" target="_blank" rel="noopener" style="color:var(--am)">Drag — NASA Glenn Research Center</a></li>
<li><a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/thrust/" target="_blank" rel="noopener" style="color:var(--am)">Thrust — NASA Glenn Research Center</a></li>
<li><a href="https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak/chapter-4-aerodynamics-flight" target="_blank" rel="noopener" style="color:var(--am)">FAA — Pilot's Handbook of Aeronautical Knowledge, capítulo 4: Aerodynamics of Flight</a> (manual técnico principal)</li></ul>
<div class="note">Material de estudio general. Los detalles dependen de cada avión y de su manual.</div>`,
 q:[
 {p:'¿Cuáles son las cuatro fuerzas principales del vuelo?',o:['Pitch, Roll, Yaw y Trim','Lift, Weight, Thrust y Drag','Flaps, Rudder, Elevator y Ailerons','Speed, Altitude, Heading y Power'],a:1,e:'Son sustentación (lift), peso (weight), empuje (thrust) y resistencia (drag).'},
 {p:'¿Qué fuerza se opone principalmente al peso?',o:['Drag','Thrust','Lift','Yaw'],a:2,e:'La sustentación se opone al peso; el empuje se opone a la resistencia.'},
 {p:'¿Qué fuerza se opone al movimiento del avión a través del aire?',o:['Lift','Weight','Thrust','Drag'],a:3,e:'La resistencia (drag) actúa en sentido contrario al movimiento.'},
 {p:'¿Qué fuerza proporciona el sistema de propulsión?',o:['Lift','Thrust','Drag','Weight'],a:1,e:'El empuje lo producen la hélice o el motor a reacción.'},
 {p:'En vuelo recto y nivelado estabilizado, ¿qué relación es aproximadamente correcta?',o:['Lift ≈ Weight y Thrust ≈ Drag','Lift ≈ Drag y Thrust ≈ Weight','Lift = 0 y Drag = 0','Thrust = 0 y Weight = 0'],a:0,e:'Las fuerzas opuestas están aproximadamente equilibradas.'},
 {p:'¿Qué ocurre generalmente cuando aumenta la velocidad y las demás condiciones permanecen similares?',o:['La resistencia parásita tiende a aumentar','El peso desaparece','El empuje desaparece','La gravedad disminuye considerablemente'],a:0,e:'La resistencia parásita aumenta rápidamente con la velocidad.'},
 {p:'¿Qué tipo de resistencia está relacionada directamente con la generación de sustentación?',o:['Parasite drag','Induced drag','Ground drag','Engine drag'],a:1,e:'La resistencia inducida aparece al producir sustentación y es mayor a baja velocidad.'},
 {p:'¿Qué ocurre con la sustentación cuando el avión cambia su ángulo de ataque dentro de su rango normal de operación?',o:['Puede cambiar','Siempre permanece exactamente igual','Desaparece inmediatamente','Se convierte en empuje'],a:0,e:'El ángulo de ataque influye de forma importante en la sustentación.'},
 {p:'¿Qué puede ocurrir si se supera el ángulo de ataque crítico?',o:['El avión entra en pérdida','Aumenta automáticamente el empuje','Desaparece el peso','El avión entra automáticamente en crucero'],a:0,e:'Superar el ángulo crítico puede provocar la pérdida (stall).'},
 {p:'¿Qué afirmación es correcta?',o:['Drag siempre es cero durante el vuelo','Thrust siempre apunta hacia arriba','Lift y Weight son fuerzas importantes que actúan sobre el avión','Weight solo existe cuando el avión está en tierra'],a:2,e:'El peso actúa siempre sobre el avión, también en vuelo, y se equilibra con la sustentación.'}]};
}