// Utilidades compartidas por todas las lecciones.
// fig(archivo, descripción, crédito)  ->  imagen guardada en la carpeta /images del proyecto.
// - "archivo" es solo el nombre (con extensión y respetando mayúsculas), por ejemplo 'Flaps_cessna.jpg'.
// - Si "archivo" va vacío (''), se muestra un marcador de "imagen pendiente".
// - "crédito" es opcional: autor y licencia (obligatorio en imágenes CC BY).
// La ruta es relativa (images/...) para que funcione en GitHub Pages.
function fig(file,alt,credit){
 if(!file)return `<div class="fig ph">Imagen pendiente: ${alt}.</div>`;
 const src='images/'+encodeURI(file),cap=`${alt}.${credit?' '+credit+'.':''}`;
 if(/\.pdf$/i.test(file))return `<figure class="fig"><iframe src="${src}" title="${alt}" style="width:100%;height:520px;border:1px solid var(--ln);border-radius:5px;background:#fff"></iframe><figcaption>${cap} <a href="${src}" target="_blank" rel="noopener" style="color:var(--am)">Abrir el PDF</a></figcaption></figure>`;
 return `<figure class="fig"><img loading="lazy" src="${src}" alt="${alt}"><figcaption>${cap}</figcaption></figure>`}
