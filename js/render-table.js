// ---- Render table + pagination ----
let currentPage = 1;

function renderTable(rows) {
  const tbody = document.getElementById('data-tbody');
  const pagination = document.getElementById('pagination-controls');
  tbody.innerHTML = '';

  const sortedRows = [...rows].reverse();
  const totalPages = Math.ceil(sortedRows.length / PAGE_SIZE);

  if (currentPage > totalPages && totalPages > 0) currentPage = totalPages;

  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
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

// Expose to global scope for onclick handlers
window.changePage = changePage;
