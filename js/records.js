// ---- Records (add / delete / clear) ----
function addRow() {
  clearError();
  
  // 2. Obtener referencias
  const elFecha = document.getElementById('inp-fecha');
  const elMin   = document.getElementById('inp-min');
  const elMax   = document.getElementById('inp-max');
  
  // Limpiar clases invalidas previas
  [elFecha, elMin, elMax].forEach(el => el.classList.remove('is-invalid'));

  // 3. Sanitizar valores crudos
  const rawFecha = elFecha.value.trim();
  // Normalizar separadores numericos si es necesario (coma a punto)
  const rawMin   = elMin.value.trim().replace(',', '.');
  const rawMax   = elMax.value.trim().replace(',', '.');

  // 4. Validar inp-fecha
  if (!rawFecha) {
    showError('La fecha es obligatoria.');
    elFecha.classList.add('is-invalid');
    return;
  }
  
  const dt = parseDateDMY(rawFecha);
  if (!dt) {
    showError('Fecha inválida o es fin de semana. Formato: dd/mm/aaaa.');
    elFecha.classList.add('is-invalid');
    return;
  }

  // Regla de negocio: no aceptar fechas futuras
  const today = new Date();
  today.setHours(0,0,0,0);
  if (dt.ts > today.getTime()) {
    showError('No se aceptan fechas futuras.');
    elFecha.classList.add('is-invalid');
    return;
  }

  // 5. Validar inp-min
  if (!rawMin) {
    showError('El valor mínimo es obligatorio.');
    elMin.classList.add('is-invalid');
    return;
  }
  const minV = Number(rawMin);
  if (!Number.isFinite(minV) || minV <= 0) {
    showError('El mínimo debe ser un número positivo.');
    elMin.classList.add('is-invalid');
    return;
  }

  // 6. Validar inp-max
  if (!rawMax) {
    showError('El valor máximo es obligatorio.');
    elMax.classList.add('is-invalid');
    return;
  }
  const maxV = Number(rawMax);
  if (!Number.isFinite(maxV) || maxV <= 0) {
    showError('El máximo debe ser un número positivo.');
    elMax.classList.add('is-invalid');
    return;
  }

  // 7. Validar la relacion entre minimo y maximo
  if (minV >= maxV) {
    showError('El mínimo debe ser menor al máximo.');
    elMin.classList.add('is-invalid');
    elMax.classList.add('is-invalid');
    return;
  }

  // 9. Construir un objeto limpio para guardar
  const rows = loadData();
  if (rows.find(r => r.label === dt.label)) {
    showError('Ya existe un registro para esa fecha.');
    elFecha.classList.add('is-invalid');
    return;
  }

  rows.push({ label: dt.label, ts: dt.ts, min: minV, max: maxV });
  rows.sort((a, b) => a.ts - b.ts);
  saveData(rows);

  // Limpiar campos y feedback
  elFecha.value = '';
  elMin.value   = '';
  elMax.value   = '';
  elFecha.focus();
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
