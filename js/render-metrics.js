// ---- Render metrics ----
function renderMetrics(rows) {
  const amps    = rows.map(r => r.max - r.min);
  const avgAmp  = amps.reduce((a, b) => a + b, 0) / amps.length;
  const avgPct  = rows.map(r => ((r.max - r.min) / r.min) * 100).reduce((a, b) => a + b, 0) / rows.length;
  const alertMin = rows.filter(r => r.min < MIN_ALERT).length;
  const alertMax = rows.filter(r => r.max > MAX_ALERT).length;

  document.getElementById('m-dias').textContent     = rows.length;
  document.getElementById('m-amp-pct').textContent  = fmtPct(avgPct);
  document.getElementById('m-amp-nom').textContent  = '$ ' + fmt(avgAmp);
  document.getElementById('m-alertmin').textContent = alertMin;
  document.getElementById('m-alertmax').textContent = alertMax;
}
