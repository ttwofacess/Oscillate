const STORAGE_KEY = 'dias_habiles_v1';
const MIN_ALERT = 60000;
const MAX_ALERT = 76000;
let chartInstance = null;
let currentPage = 1;
const pageSize = 5;

/* ---- Navigation ---- */
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

/* ---- SEARCH LOGIC ---- */
function doSearch() {
  const val = parseFloat(document.getElementById('inp-search').value);
  const rows = loadData();
  const tbody = document.getElementById('search-tbody');
  const emptyMsg = document.getElementById('search-results-empty');
  const tableWrap = document.getElementById('search-results-table');

  if (isNaN(val)) {
    emptyMsg.style.display = 'block';
    tableWrap.style.display = 'none';
    return;
  }

  const matches = rows.filter(r => val >= r.min && val <= r.max);

  if (matches.length === 0) {
    emptyMsg.innerHTML = `<p>No hay coincidencias para <b>$ ${fmt(val)}</b>.<br>El precio no pasó por ese valor en los días registrados.</p>`;
    emptyMsg.style.display = 'block';
    tableWrap.style.display = 'none';
  } else {
    emptyMsg.style.display = 'none';
    tableWrap.style.display = 'block';
    tbody.innerHTML = '';
    
    matches.reverse().forEach(r => {
      let rel = '';
      if (val === r.min) rel = '<span class="badge badge-red">Mínimo exacto</span>';
      else if (val === r.max) rel = '<span class="badge badge-amber">Máximo exacto</span>';
      else rel = '<span class="badge badge-green">En rango</span>';

      tbody.innerHTML += `<tr>
        <td style="font-weight:500">${r.label}</td>
        <td class="num">$ ${fmt(r.min)}</td>
        <td class="num">$ ${fmt(r.max)}</td>
        <td>${rel}</td>
      </tr>`;
    });
  }
}

/* ---- Storage ---- */
function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch(e) { return []; }
}
function saveData(rows) { localStorage.setItem(STORAGE_KEY, JSON.stringify(rows)); }

/* ---- Formatting ---- */
function fmt(n) {
  return Number(n).toLocaleString('es-AR', { maximumFractionDigits: 0 });
}
function fmtPct(v) { return v.toFixed(2) + '%'; }

/* ---- Date parse & validate ---- */
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

/* ---- UI helpers ---- */
function showError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.style.display = 'block';
}
function clearError() {
  document.getElementById('form-error').style.display = 'none';
}

/* ---- ADD ROW ---- */
function addRow() {
  clearError();
  const fecha = document.getElementById('inp-fecha').value;
  const minV  = parseFloat(document.getElementById('inp-min').value);
  const maxV  = parseFloat(document.getElementById('inp-max').value);

  const dt = parseDateDMY(fecha);
  if (!dt) { showError('Fecha inválida o es fin de semana. Formato: dd/mm/aaaa.'); return; }
  if (isNaN(minV) || isNaN(maxV)) { showError('Ingresá valores numéricos para mínimo y máximo.'); return; }
  if (minV <= 0 || maxV <= 0) { showError('Los valores deben ser positivos.'); return; }
  if (minV >= maxV) { showError('El mínimo debe ser menor al máximo.'); return; }

  const rows = loadData();
  if (rows.find(r => r.label === dt.label)) { showError('Ya existe un registro para esa fecha.'); return; }

  rows.push({ label: dt.label, ts: dt.ts, min: minV, max: maxV });
  rows.sort((a, b) => a.ts - b.ts);
  saveData(rows);

  document.getElementById('inp-fecha').value = '';
  document.getElementById('inp-min').value   = '';
  document.getElementById('inp-max').value   = '';
  document.getElementById('inp-fecha').focus();
  render();
}

/* ---- DELETE ROW ---- */
function deleteRow(ts) {
  const rows = loadData().filter(r => r.ts !== Number(ts));
  saveData(rows);
  render();
}

/* ---- CLEAR ALL ---- */
function clearAll() {
  if (!confirm('¿Borrar todos los datos? Esta acción no se puede deshacer.')) return;
  localStorage.removeItem(STORAGE_KEY);
  render();
}

/* ---- MAIN RENDER ---- */
function render() {
  const rows = loadData();
  const empty = rows.length === 0;

  document.getElementById('empty-msg').style.display      = empty ? 'block' : 'none';
  document.getElementById('chart-section').style.display  = empty ? 'none'  : 'block';
  document.getElementById('table-section').style.display  = empty ? 'none'  : 'block';
  document.getElementById('metrics-section').style.display= empty ? 'none'  : 'grid';

  if (!empty) {
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

    renderChart(rows);
    renderTable(rows);
  }
}

/* ---- CHART ---- */
function renderChart(rows) {
  const chartArea = document.getElementById('chart-area');
  
  // Ajuste de ancho: mostrar ~5 por pantalla (680px max / 5 = ~136px por barra)
  // Forzamos un ancho mínimo por cada fecha si hay más de 5.
  if (rows.length > 5) {
    const minWidthPerDate = 120; // píxeles por fecha
    chartArea.style.width = (rows.length * minWidthPerDate) + 'px';
  } else {
    chartArea.style.width = '100%';
  }

  const canvas = document.getElementById('main-chart');
  const labels  = rows.map(r => r.label);
  const minData = rows.map(r => r.min);
  const maxData = rows.map(r => r.max);

  const allVals  = [...minData, ...maxData];
  const dataMin  = Math.min(...allVals);
  const dataMax  = Math.max(...allVals);
  const pad      = Math.max((dataMax - dataMin) * 0.15, 3000);
  const yMin     = Math.floor(Math.min(dataMin, MIN_ALERT - pad) / 1000) * 1000;
  const yMax     = Math.ceil(Math.max(dataMax, MAX_ALERT + pad)  / 1000) * 1000;

  const barColors = rows.map(r => {
    if (r.min < MIN_ALERT) return 'rgba(248,81,73,.65)';
    if (r.max > MAX_ALERT) return 'rgba(210,153,34,.65)';
    return 'rgba(56,139,253,.65)';
  });
  const borderColors = rows.map(r => {
    if (r.min < MIN_ALERT) return '#f85149';
    if (r.max > MAX_ALERT) return '#d29922';
    return '#388bfd';
  });

  if (chartInstance) { chartInstance.destroy(); }

  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Rango',
          data: rows.map(r => r.max - r.min),
          base: minData,
          backgroundColor: barColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          borderRadius: 3,
        },
        {
          label: 'Mínimo',
          data: minData,
          type: 'line',
          borderColor: 'rgba(248,81,73,.5)',
          borderWidth: 1.5,
          borderDash: [4, 3],
          pointRadius: 3,
          pointBackgroundColor: '#f85149',
          pointBorderColor: 'transparent',
          tension: 0.35,
          order: 0,
        },
        {
          label: 'Máximo',
          data: maxData,
          type: 'line',
          borderColor: 'rgba(210,153,34,.5)',
          borderWidth: 1.5,
          borderDash: [4, 3],
          pointRadius: 3,
          pointBackgroundColor: '#d29922',
          pointBorderColor: 'transparent',
          tension: 0.35,
          order: 0,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c2128',
          borderColor: 'rgba(255,255,255,.12)',
          borderWidth: 1,
          titleColor: '#e6edf3',
          bodyColor: '#7d8590',
          titleFont: { family: "'IBM Plex Mono'", size: 12 },
          bodyFont: { family: "'IBM Plex Mono'", size: 11 },
          padding: 10,
          callbacks: {
            title: ctx => ctx[0].label,
            label: ctx => {
              const r = rows[ctx.dataIndex];
              if (!r) return '';
              const amp = r.max - r.min;
              const pct = ((r.max - r.min) / r.min * 100).toFixed(2);
              const alerts = [];
              if (r.min < MIN_ALERT) alerts.push('⚠ mín bajo 60.000');
              if (r.max > MAX_ALERT) alerts.push('⚠ máx sobre 76.000');
              return [
                `mín: $ ${fmt(r.min)}`,
                `máx: $ ${fmt(r.max)}`,
                `amp: $ ${fmt(amp)}  (${pct}%)`,
                ...alerts
              ];
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,.05)' },
          ticks: {
            color: '#7d8590',
            font: { family: "'IBM Plex Mono'", size: 10 },
            maxRotation: 45,
            autoSkip: false,
          }
        },
        y: {
          min: yMin, max: yMax,
          grid: { color: 'rgba(255,255,255,.05)' },
          ticks: {
            color: '#7d8590',
            font: { family: "'IBM Plex Mono'", size: 10 },
            callback: v => fmt(v)
          }
        }
      }
    },
    plugins: [{
      id: 'refLines',
      afterDraw(chart) {
        const { ctx, chartArea: { left, right }, scales: { y } } = chart;
        [
          [MIN_ALERT, '#f85149', '60.000'],
          [MAX_ALERT, '#d29922', '76.000']
        ].forEach(([val, col, lbl]) => {
          const yPos = y.getPixelForValue(val);
          ctx.save();
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 4]);
          ctx.globalAlpha = .8;
          ctx.beginPath();
          ctx.moveTo(left, yPos);
          ctx.lineTo(right, yPos);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.globalAlpha = 1;
          ctx.fillStyle = col;
          ctx.font = "500 10px 'IBM Plex Mono'";
          ctx.fillText(lbl, left + 4, yPos - 4);
          ctx.restore();
        });
      }
    }]
  });

  // Scroll al final si se acaba de agregar un dato
  const wrap = document.querySelector('.chart-wrap');
  wrap.scrollLeft = wrap.scrollWidth;
}

/* ---- TABLE ---- */
function renderTable(rows) {
  const tbody = document.getElementById('data-tbody');
  const pagination = document.getElementById('pagination-controls');
  tbody.innerHTML = '';
  
  const sortedRows = [...rows].reverse();
  const totalPages = Math.ceil(sortedRows.length / pageSize);
  
  // Ajustar página actual si queda fuera de rango (ej. al borrar)
  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageRows = sortedRows.slice(start, end);

  pageRows.forEach(r => {
    const amp    = r.max - r.min;
    const ampPct = ((r.max - r.min) / r.min * 100).toFixed(2);
    let badges   = '';
    if (r.min < MIN_ALERT) badges += `<span class="badge badge-red">Mín bajo</span> `;
    if (r.max > MAX_ALERT) badges += `<span class="badge badge-amber">Máx alto</span>`;
    if (!badges)            badges  = `<span class="badge badge-green">Normal</span>`;

    const minColor = r.min < MIN_ALERT ? 'color:#f85149' : '';
    const maxColor = r.max > MAX_ALERT ? 'color:#d29922' : '';

    tbody.innerHTML += `<tr>
      <td style="font-weight:500;white-space:nowrap">${r.label}</td>
      <td class="num" style="${minColor}">$ ${fmt(r.min)}</td>
      <td class="num" style="${maxColor}">$ ${fmt(r.max)}</td>
      <td class="num">$ ${fmt(amp)}</td>
      <td class="num">${ampPct}%</td>
      <td>${badges}</td>
      <td><button class="del-btn" onclick="deleteRow(${r.ts})" title="Eliminar">×</button></td>
    </tr>`;
  });

  // Render pagination controls
  if (totalPages > 1) {
    pagination.innerHTML = `
      <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(-1)">← Ant.</button>
      <span class="page-info">Pág. ${currentPage} de ${totalPages}</span>
      <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(1)">Sig. →</button>
    `;
  } else {
    pagination.innerHTML = '';
  }
}

function changePage(delta) {
  currentPage += delta;
  render();
}

/* ---- KEYBOARD ---- */
document.getElementById('inp-max').addEventListener('keydown', e => {
  if (e.key === 'Enter') addRow();
});
document.getElementById('inp-fecha').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('inp-min').focus();
});
document.getElementById('inp-min').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('inp-max').focus();
});

/* ---- AUTO-FORMAT fecha ---- */
document.getElementById('inp-fecha').addEventListener('input', function() {
  let v = this.value.replace(/\D/g, '');
  if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
  if (v.length > 5) v = v.slice(0,5) + '/' + v.slice(5);
  this.value = v.slice(0,10);
});

/* ---- INIT ---- */
render();