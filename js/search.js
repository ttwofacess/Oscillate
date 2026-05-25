// ---- Search logic ----
const SEARCH_VALUE_MAX = 1000000000;

function sanitizeSearchInput(rawValue) {
  return String(rawValue ?? '').trim().replace(',', '.');
}

function validateSearchValue(sanitizedValue) {
  if (sanitizedValue === '') {
    return {
      isValid: false,
      value: null,
      message: 'Ingresa un valor numerico para buscar coincidencias.'
    };
  }

  if (!/^\d+(\.\d+)?$/.test(sanitizedValue)) {
    return {
      isValid: false,
      value: null,
      message: 'El valor solo puede contener numeros y un separador decimal.'
    };
  }

  const value = Number(sanitizedValue);

  if (!Number.isFinite(value)) {
    return {
      isValid: false,
      value: null,
      message: 'Ingresa un numero valido.'
    };
  }

  if (value < 0) {
    return {
      isValid: false,
      value: null,
      message: 'El valor debe ser mayor o igual a 0.'
    };
  }

  if (value > SEARCH_VALUE_MAX) {
    return {
      isValid: false,
      value: null,
      message: `El valor debe ser menor o igual a ${fmt(SEARCH_VALUE_MAX)}.`
    };
  }

  return {
    isValid: true,
    value,
    message: ''
  };
}

function setSearchMessage(message, value) {
  const emptyMsg = document.getElementById('search-results-empty');
  emptyMsg.replaceChildren();

  const paragraph = document.createElement('p');
  if (value === undefined) {
    paragraph.textContent = message;
    emptyMsg.appendChild(paragraph);
    return;
  }

  paragraph.append('No hay coincidencias para ');

  const amount = document.createElement('b');
  amount.textContent = `$ ${fmt(value)}`;
  paragraph.appendChild(amount);

  paragraph.append('.');
  paragraph.appendChild(document.createElement('br'));
  paragraph.append('El precio no paso por ese valor en los dias registrados.');
  emptyMsg.appendChild(paragraph);
}

function createSearchBadge(text, className) {
  const badge = document.createElement('span');
  badge.className = `badge ${className}`;
  badge.textContent = text;
  return badge;
}

function renderSearchRow(tbody, row, value) {
  const tr = document.createElement('tr');

  const labelCell = document.createElement('td');
  labelCell.style.fontWeight = '500';
  labelCell.textContent = row.label;

  const minCell = document.createElement('td');
  minCell.className = 'num';
  minCell.textContent = `$ ${fmt(row.min)}`;

  const maxCell = document.createElement('td');
  maxCell.className = 'num';
  maxCell.textContent = `$ ${fmt(row.max)}`;

  const relationCell = document.createElement('td');
  if (value === row.min) {
    relationCell.appendChild(createSearchBadge('Minimo exacto', 'badge-red'));
  } else if (value === row.max) {
    relationCell.appendChild(createSearchBadge('Maximo exacto', 'badge-amber'));
  } else {
    relationCell.appendChild(createSearchBadge('En rango', 'badge-green'));
  }

  tr.append(labelCell, minCell, maxCell, relationCell);
  tbody.appendChild(tr);
}

function doSearch() {
  const input = document.getElementById('inp-search');
  const sanitizedValue = sanitizeSearchInput(input.value);
  const validation = validateSearchValue(sanitizedValue);
  const tbody = document.getElementById('search-tbody');
  const emptyMsg = document.getElementById('search-results-empty');
  const tableWrap = document.getElementById('search-results-table');

  tbody.replaceChildren();

  if (!validation.isValid) {
    setSearchMessage(validation.message);
    emptyMsg.style.display = 'block';
    tableWrap.style.display = 'none';
    return;
  }

  if (input.value !== sanitizedValue) {
    input.value = sanitizedValue;
  }

  const val = validation.value;
  const rows = loadData();
  const matches = rows.filter(r => val >= r.min && val <= r.max);

  if (matches.length === 0) {
    setSearchMessage('', val);
    emptyMsg.style.display = 'block';
    tableWrap.style.display = 'none';
    return;
  }

  emptyMsg.style.display = 'none';
  tableWrap.style.display = 'block';

  matches.slice().reverse().forEach(r => renderSearchRow(tbody, r, val));
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
  tbody.replaceChildren();

  const tr = document.createElement('tr');

  const labelCell = document.createElement('td');
  labelCell.style.fontWeight = '500';
  labelCell.textContent = extremeRow.label;

  const minCell = document.createElement('td');
  minCell.className = 'num';
  minCell.textContent = `$ ${fmt(extremeRow.min)}`;

  const maxCell = document.createElement('td');
  maxCell.className = 'num';
  maxCell.textContent = `$ ${fmt(extremeRow.max)}`;

  const badgeCell = document.createElement('td');
  badgeCell.appendChild(type === 'min'
    ? createSearchBadge('Minimo Historico', 'badge-red')
    : createSearchBadge('Maximo Historico', 'badge-amber'));

  tr.append(labelCell, minCell, maxCell, badgeCell);
  tbody.appendChild(tr);
}
