// backend/static/js/api_local.js
export async function ejecutarPipeline() {
  const r = await fetch('/api/pipeline/run', { method: 'POST' });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function obtenerItemsLimpios() {
  const r = await fetch('/api/cleaned');
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function obtenerItemsRaw() {
  const r = await fetch('/api/items');
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function crearItem(item) {
  const r = await fetch('/api/items', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(item),
  });
  if (!r.ok) throw new Error(await r.text());
  return await r.json();
}

export async function deleteItem(id) {
  const r = await fetch(`/api/items/${id}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(await r.text());
}

