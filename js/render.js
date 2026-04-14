// ---- Main render coordinator ----
function render() {
  const rows = loadData();
  const empty = rows.length === 0;

  document.getElementById('empty-msg').style.display        = empty ? 'block' : 'none';
  document.getElementById('chart-section').style.display    = empty ? 'none'  : 'block';
  document.getElementById('table-section').style.display    = empty ? 'none'  : 'block';
  document.getElementById('metrics-section').style.display  = empty ? 'none'  : 'grid';

  if (!empty) {
    renderMetrics(rows);
    renderChart(rows);
    renderTable(rows);
  }
}
