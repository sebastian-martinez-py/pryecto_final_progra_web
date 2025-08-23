// Backend/static/js/main.js
// CHANGE: slideshow API externa + render de cleaned items.

import { obtenerItemsLimpios } from './api_local.js';

let images = [];
let index = 0;

async function cargarImagenes() {
  try {
    const r = await fetch('https://dog.ceo/api/breeds/image/random/5');
    const data = await r.json();
    images = data.message || [];
    index = 0;
    mostrarImagen();
  } catch (e) {
    console.error('No se pudieron cargar imágenes:', e);
  }
}
function mostrarImagen() {
  const el = document.getElementById('slide-image');
  if (el && images.length) el.src = images[index];
}
function siguienteImagen() {
  if (!images.length) return;
  index = (index + 1) % images.length;
  mostrarImagen();
}
function anteriorImagen() {
  if (!images.length) return;
  index = (index - 1 + images.length) % images.length;
  mostrarImagen();
}

async function renderItemsLimpios() {
  const cont = document.getElementById('api-local');
  if (!cont) return;
  cont.innerHTML = '<p class="text-slate-500">Cargando…</p>';
  try {
    const rows = await obtenerItemsLimpios();
    if (!rows.length) {
      cont.innerHTML = '<p class="text-slate-500">Sin datos procesados aún.</p>';
      return;
    }
    cont.innerHTML = rows.map(r => `
      <div class="p-4 border rounded-2xl shadow-sm">
        ${r.image_url ? `<img src="${r.image_url}" alt="${r.title}" class="w-full h-48 object-cover mb-2 rounded-xl"/>` : ''}
        <h3 class="font-semibold">${r.title}</h3>
        ${r.description ? `<p class="text-sm text-slate-600">${r.description}</p>` : ''}
      </div>
    `).join('');
  } catch (e) {
    cont.innerHTML = `<p class="text-red-600">Error cargando datos: ${e}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await cargarImagenes();
  document.getElementById('prev-image')?.addEventListener('click', anteriorImagen);
  document.getElementById('next-image')?.addEventListener('click', siguienteImagen);
  await renderItemsLimpios();
});
