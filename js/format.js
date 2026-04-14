// ---- Formatting ----
function fmt(n) {
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}
function fmtPct(v) { return v.toFixed(2) + '%'; }

function parseDateDMY(s) {
  const parts = s.trim().split('/');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts.map(Number);
  if ([d, m, y].some(isNaN)) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000) return null;
  const dt = new Date(y, m - 1, d);
  if (dt.getDate() !== d || dt.getMonth() !== m - 1 || dt.getFullYear() !== y) return null;
  const dow = dt.getDay();
  if (dow === 0 || dow === 6) return null; // fin de semana
  const label = `${String(d).padStart(2,'0')}/${String(m).padStart(2,'0')}/${y}`;
  return { ts: dt.getTime(), label };
}
