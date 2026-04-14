// ---- Event listeners & bootstrap ----

// Keyboard shortcuts
document.getElementById('inp-max').addEventListener('keydown', e => {
  if (e.key === 'Enter') addRow();
});
document.getElementById('inp-fecha').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('inp-min').focus();
});
document.getElementById('inp-min').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('inp-max').focus();
});

// Auto-format fecha input
document.getElementById('inp-fecha').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
  if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5);
  this.value = v.slice(0,10);
});

// Init
render();
