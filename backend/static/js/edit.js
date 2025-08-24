// API
const api = {
  async buscarPorNombre(nombre){
    const r = await fetch(`/api/items/search?pet_name=${encodeURIComponent(nombre)}`);
    if(!r.ok) throw new Error(`HTTP ${r.status}`); return r.json();
  },
  async actualizarContacto(itemId, data){
    const r = await fetch(`/api/items/${itemId}/contact`,{
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body:JSON.stringify(data)
    });
    if(!r.ok){ let t=''; try{t=await r.text();}catch{}; throw new Error(`HTTP ${r.status} ${t}`); }
    return r.json();
  },
  async eliminarItem(id){
    const r = await fetch(`/api/items/${id}`, { method:'DELETE' });
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return true;
  }
};

const $ = s => document.querySelector(s);

$('#formBuscar').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const nombre = $('#qNombre').value.trim();
  if(!nombre) return;
  const cont = $('#resultados');
  cont.innerHTML = '<p class="muted">Buscando…</p>';
  try{
    const res = await api.buscarPorNombre(nombre);
    if(res.length === 0){ cont.innerHTML = '<p class="muted">Sin resultados.</p>'; return; }
    cont.innerHTML = res.map(r => editorContacto(r)).join('');
    wireEditors(cont);
  }catch(err){
    cont.innerHTML = `<p class="muted">Error en búsqueda: ${err.message}</p>`;
    console.error(err);
  }
});

function editorContacto(it){
  return `
  <article class="panel" style="margin-bottom:12px">
    <div class="row" style="justify-content:space-between">
      <div class="grow">
        <strong>${escapeHtml(it.title)}</strong>
        <div class="muted">ID: ${it.id} — ${it.kind === 'ADOPT' ? 'Adoptable' : 'Perdido'}</div>
      </div>
      <button class="btn btn-danger" data-delete="${it.id}">Eliminar</button>
    </div>
    <form data-edit="${it.id}" class="grid two" style="margin-top:10px">
      <div><label>Nombre contacto</label><input name="contact_name" value="${escapeHtml(it.contact_name||'')}" /></div>
      <div><label>Teléfono</label><input name="contact_phone" value="${escapeHtml(it.contact_phone||'')}" /></div>
      <div><label>Correo</label><input type="email" name="contact_email" value="${escapeHtml(it.contact_email||'')}" /></div>
      <div style="grid-column:1/-1;display:flex;gap:10px;align-items:center">
        <button class="btn btn-primary" type="submit">Guardar cambios</button>
        <span class="help"></span>
      </div>
    </form>
  </article>`;
}

function wireEditors(container){
  // Guardar
  container.querySelectorAll('form[data-edit]').forEach(f=>{
    f.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      const fd = new FormData(f);
      const body = {
        contact_name: fd.get('contact_name') || null,
        contact_phone: fd.get('contact_phone') || null,
        contact_email: fd.get('contact_email') || null,
      };
      const id = f.dataset.edit;
      const help = f.querySelector('.help');
      help.textContent = 'Guardando…';
      try{
        await api.actualizarContacto(id, body);
        help.textContent = 'Guardado ✓';
      }catch(err){
        help.textContent = 'Error al guardar';
        console.error(err);
      }
    });
  });

  // Eliminar
  container.querySelectorAll('button[data-delete]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const id = btn.dataset.delete;
      if(!confirm('¿Eliminar esta publicación?')) return;
      try{
        await api.eliminarItem(id);
        btn.closest('.panel').remove();
      }catch(err){
        alert('No se pudo eliminar: ' + err.message);
        console.error(err);
      }
    });
  });
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m])); }
