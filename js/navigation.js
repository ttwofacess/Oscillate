// ---- Navigation ----
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  btn.classList.add('active');

  if (tabId === 'search-view') {
    document.getElementById('inp-search').focus();
  } else {
    render(); // Refrescar gráficos por si hubo cambios
  }
}
