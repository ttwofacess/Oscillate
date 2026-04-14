// ---- Records (add / delete / clear) ----
function addRow() {
  clearError();
  const fecha = document.getElementById('inp-fecha').value;
  const minV  = parseFloat(document.getElementById('inp-min').value);
  const maxV  = parseFloat(document.getElementById('inp-max').value);

  const dt = parseDateDMY(fecha);
  if (!dt) { showError('Fecha inválida o es fin de semana. Formato: dd/mm/aaaa.'); return; }
  if (isNaN(minV) || isNaN(maxV)) { showError('Ingresá valores numéricos para mínimo y máximo.'); return; }
  if (minV <= 0 || maxV <= 0) { showError('Los valores deben ser positivos.'); return; }
  if (minV >= maxV) { showError('El mínimo debe ser menor al máximo.'); return; }

  const rows = loadData();
  if (rows.find(r => r.label === dt.label)) { showError('Ya existe un registro para esa fecha.'); return; }

  rows.push({ label: dt.label, ts: dt.ts, min: minV, max: maxV });
  rows.sort((a, b) => a.ts - b.ts);
  saveData(rows);

  document.getElementById('inp-fecha').value = '';
  document.getElementById('inp-min').value   = '';
  document.getElementById('inp-max').value   = '';
  document.getElementById('inp-fecha').focus();
  render();
}

function deleteRow(ts) {
  const rows = loadData().filter(r => r.ts !== Number(ts));
  saveData(rows);
  render();
}

function clearAll() {
  if (!confirm('¿Borrar todos los datos? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
}

// Expose to global scope for onclick handlers
window.deleteRow = deleteRow;
