// ---- Export / Import ----
function exportData() {
  const rows = loadData();
  if (rows.length === 0) { alert('No hay datos para exportar.'); return; }

  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `wallstreet_tracker_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function triggerImport() {
  document.getElementById('inp-import').click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const rows = JSON.parse(e.target.result);
      if (!Array.isArray(rows)) throw new Error('El archivo no contiene una lista válida.');

      const valid = rows.every(r => r.label && r.ts && typeof r.min === 'number' && typeof r.max === 'number');
      if (!valid) throw new Error('El formato de los datos no es correcto.');

      if (confirm(`Se importarán ${rows.length} registros. ¿Deseas sobrescribir los datos actuales?`)) {
        saveData(rows);
        render();
        alert('Datos importados con éxito.');
      }
    } catch (err) {
      alert('Error al importar: ' + err.message);
    }
    event.target.value = '';
  };
  reader.readAsText(file);
}
