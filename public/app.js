async function api(path, options){
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json().catch(()=>({}));
  if(!res.ok){
    const msg = data && data.error ? data.error : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

async function loadStudents(){
  const { students } = await api('/api/students');
  return students || [];
}

function escapeHtml(str){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','<')
    .replaceAll('>','>')
    .replaceAll('"','"')
    .replaceAll("'",'&#039;');
}

function setNotice(el, kind, text){
  if(!el) return;
  el.className = `notice ${kind || ''}`.trim();
  el.textContent = text;
}

