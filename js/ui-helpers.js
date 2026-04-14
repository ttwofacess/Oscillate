// ---- UI helpers ----
function showError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.style.display = 'block';
}
function clearError() {
  document.getElementById('form-error').style.display = 'none';
}
