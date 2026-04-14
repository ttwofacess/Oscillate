// ---- Search logic ----
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

function findExtreme(type) {
  const rows = loadData();
  if (rows.length === 0) return;

  let extremeRow;
  if (type === 'min') {
    extremeRow = rows.reduce((prev, curr) => (prev.min < curr.min) ? prev : curr);
  } else {
    extremeRow = rows.reduce((prev, curr) => (prev.max > curr.max) ? prev : curr);
  }

  document.getElementById('inp-search').value = '';

  const tbody = document.getElementById('search-tbody');
  const emptyMsg = document.getElementById('search-results-empty');
  const tableWrap = document.getElementById('search-results-table');

  emptyMsg.style.display = 'none';
  tableWrap.style.display = 'block';
  tbody.innerHTML = '';

  const labelBadge = type === 'min'
    ? '<span class="badge badge-red">Mínimo Histórico</span>'
    : '<span class="badge badge-amber">Máximo Histórico</span>';

  tbody.innerHTML = `<tr>
    <td style="font-weight:500">${extremeRow.label}</td>
    <td class="num">$ ${fmt(extremeRow.min)}</td>
    <td class="num">$ ${fmt(extremeRow.max)}</td>
    <td>${labelBadge}</td>
  </tr>`;
}
