// ---- Storage ----
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch(e) { return []; }
}
function saveData(rows) { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); }
