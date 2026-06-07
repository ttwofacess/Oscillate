// ---- Render metrics ----
function renderMetrics(rows) {
  const amps    = rows.map(r => r.max - r.min);
  const avgAmp  = amps.reduce((a, b) => a + b, 0) / amps.length;
  const avgPct  = rows.map(r => ((r.max - r.min) / r.min) * 100).reduce((a, b) => a + b, 0) / rows.length;
  const alertMin = rows.filter(r => r.min < MIN_ALERT).length;
  const alertMax = rows.filter(r => r.max > MAX_ALERT).length;

  // Last MA50
  const lastIdx = rows.length - 1;
  const startIdx = Math.max(0, lastIdx - 49);
  const window = rows.slice(startIdx, lastIdx + 1);
  const midpoints = window.map(r => (r.min + r.max) / 2);
  const ma50Value = midpoints.reduce((a, b) => a + b, 0) / midpoints.length;
  const ma50Count = window.length;

  document.getElementById('m-dias').textContent     = rows.length;
  document.getElementById('m-amp-pct').textContent  = fmtPct(avgPct);
  document.getElementById('m-amp-nom').textContent  = '$ ' + fmt(avgAmp);
  document.getElementById('m-alertmin').textContent = alertMin;
  document.getElementById('m-alertmax').textContent = alertMax;
  document.getElementById('m-ma50').textContent     = '$ ' + fmt(ma50Value);
  document.getElementById('m-ma50-sub').textContent = ma50Count < 50 
    ? `Prom. de ${ma50Count} días (n<50)` 
    : 'Prom. móvil 50 días';
}
