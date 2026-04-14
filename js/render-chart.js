// ---- Render chart ----
let chartInstance = null;

function renderChart(rows) {
  const chartArea = document.getElementById('chart-area');

  if (rows.length > 5) {
    const minWidthPerDate = 120;
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

  const wrap = document.querySelector('.chart-wrap');
  wrap.scrollLeft = wrap.scrollWidth;
}
