// ---- State ----
let currentDate = new Date();
let period = 'month';
let viewMode = 'category'; // 'category' or 'date'
let accounts = [];
let categories = [];
let categoryGroups = [];
let transactions = [];
let selectedAccount = 'all';
let carryOverBalance = 0;

// Restore state from localStorage
(function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem('viewerState'));
    if (!saved) return;
    if (saved.account) selectedAccount = saved.account;
    if (saved.period) period = saved.period;
    if (saved.date) currentDate = new Date(saved.date + 'T00:00:00');
  } catch (e) {
    /* ignore */
  }
})();

function saveState() {
  localStorage.setItem(
    'viewerState',
    JSON.stringify({
      account: selectedAccount,
      period: period,
      date: toDateStr(currentDate),
    }),
  );
}

// Account icons mapping
const ACCOUNT_ICONS = {
  'All accounts': '\uD83C\uDFF7\uFE0F',
  'Todas las cuentas': '\uD83C\uDFF7\uFE0F',
  '0 Con Merche': '\u00A5',
  '1 Cash': '\uD83D\uDCB5',
  '2 Payment card': '\uD83D\uDCB3',
  '5 Deuda Hacienda': '\uD83C\uDFE6',
  '7 Hipoteca': '\uD83C\uDFE0',
  '8 Pensi\u00F3n': '\uD83D\uDCCA',
  Crescenta: '\uD83D\uDCC8',
  Cripto: '\u20BF',
  'Deuda Lidia': '\uD83E\uDD1D',
  'Fondo Emerging': '\uD83C\uDF0D',
  'Fondo Ibex35': '\uD83C\uDDEA\uD83C\uDDF8',
  'Fondo Monetario': '\uD83D\uDC37',
  'Fondo SP500': '\uD83C\uDDFA\uD83C\uDDF8',
  'Fondo Tec': '\uD83D\uDCBB',
  'h.': '\uD83D\uDC36',
  Inversiva: '\uD83D\uDCCA',
};

function getAccountIcon(name) {
  if (ACCOUNT_ICONS[name]) return ACCOUNT_ICONS[name];
  for (const [key, icon] of Object.entries(ACCOUNT_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '\uD83D\uDCB0';
}

// Category icons
const ICONS = {
  Salario: '\uD83D\uDCB6',
  Salary: '\uD83D\uDCB6',
  Sueldo: '\uD83D\uDCB6',
  'N\u00F3mina': '\uD83D\uDCB6',
  Comida: '\uD83E\uDD57',
  Food: '\uD83E\uDD57',
  'Alimentaci\u00F3n': '\uD83D\uDED2',
  Groceries: '\uD83D\uDED2',
  Supermercado: '\uD83D\uDED2',
  Transporte: '\uD83D\uDE8C',
  Transport: '\uD83D\uDE8C',
  Gasolina: '\u26FD',
  Entretenimiento: '\uD83C\uDFAC',
  Entertainment: '\uD83C\uDFAC',
  Ocio: '\uD83C\uDFAC',
  Shopping: '\uD83D\uDECD\uFE0F',
  Compras: '\uD83D\uDECD\uFE0F',
  Ropa: '\uD83D\uDC55',
  Clothes: '\uD83D\uDC55',
  Salud: '\uD83D\uDC8A',
  Health: '\uD83D\uDC8A',
  'M\u00E9dico': '\uD83C\uDFE5',
  'Casa Yuncler': '\uD83C\uDFE0',
  Home: '\uD83C\uDFE0',
  Casa: '\uD83C\uDFE0',
  Hogar: '\uD83C\uDFE0',
  'Alquiler Haro': '\uD83C\uDFE0',
  'Alquiler Yuncler': '\uD83C\uDFE0',
  Alquiler: '\uD83C\uDFE0',
  Hipoteca: '\uD83C\uDFE0',
  Impuestos: '\uD83C\uDFF7\uFE0F',
  Bills: '\uD83C\uDFF7\uFE0F',
  Facturas: '\uD83D\uDCC4',
  Suscripciones: '\uD83D\uDCF1',
  'Formaci\u00F3n': '\uD83D\uDCDA',
  Education: '\uD83D\uDCDA',
  'Educaci\u00F3n': '\uD83D\uDCDA',
  House: '\uD83C\uDFE0',
  Travel: '\u2708\uFE0F',
  Viajes: '\u2708\uFE0F',
  Regalos: '\uD83C\uDF81',
  Gifts: '\uD83C\uDF81',
  Deportes: '\uD83C\uDFCB\uFE0F',
  Sports: '\uD83C\uDFCB\uFE0F',
  Deporte: '\uD83C\uDFCB\uFE0F',
  Gabi: '\uD83D\uDC36',
  Pets: '\uD83D\uDC3E',
  Mascotas: '\uD83D\uDC3E',
  Transfers: '\u21C4',
  Transferencias: '\u21C4',
  Inversiones: '\uD83D\uDCC8',
  Investment: '\uD83D\uDCC8',
  'Comer fuera': '\uD83C\uDF7D\uFE0F',
  Restaurantes: '\uD83C\uDF7D\uFE0F',
  Restaurant: '\uD83C\uDF7D\uFE0F',
  'Eating out': '\uD83C\uDF7D\uFE0F',
  'Eating Out': '\uD83C\uDF7D\uFE0F',
  Taxi: '\uD83D\uDE95',
  Coche: '\uD83D\uDE97',
  Car: '\uD83D\uDE97',
  Comunicaciones: '\uD83D\uDCF1',
  Communications: '\uD83D\uDCF1',
  Ajustes: '\u2699\uFE0F',
  'Ajustes (Ingresos)': '\u2699\uFE0F',
  Settings: '\u2699\uFE0F',
  'Caf\u00E9': '\u2615',
  Coffee: '\u2615',
  Pagado: '\uD83D\uDE0A',
  Savings: '\uD83D\uDC37',
  Mindfulness: '\uD83E\uDDD8',
  'Ingresos Mindfulness': '\uD83E\uDDD8',
  'Starting Balance': '\uD83C\uDFC1',
  'Starting Balances': '\uD83C\uDFC1',
  Go: '\uD83D\uDE80',
  'Pol\u00EDtica': '\uD83C\uDFDB\uFE0F',
  Politica: '\uD83C\uDFDB\uFE0F',
  Hotel: '\uD83C\uDFE8',
  Toiletry: '\uD83E\uDDF4',
};

function getIcon(name) {
  if (ICONS[name]) return ICONS[name];
  const nameLower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ICONS)) {
    const re = new RegExp(
      '\\b' + key.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b',
      'i',
    );
    if (re.test(nameLower)) return icon;
  }
  if (
    name.startsWith('\u2192 ') ||
    name.startsWith('To ') ||
    name.startsWith('From ')
  )
    return '\u21C4';
  return '\uD83D\uDCE6';
}

// Category colors
const COLORS = [
  '#ff6b6b',
  '#feca57',
  '#48dbfb',
  '#ff9ff3',
  '#54a0ff',
  '#5f27cd',
  '#01a3a4',
  '#f368e0',
  '#ee5a24',
  '#009432',
  '#6c5ce7',
  '#fdcb6e',
  '#e17055',
  '#00b894',
  '#e84393',
  '#0984e3',
  '#fd79a8',
  '#636e72',
  '#fab1a0',
  '#74b9ff',
];

function getColor(name) {
  // Override colors for categories with poor emoji/background contrast
  const COLOR_OVERRIDES = {
    Pets: '#00b894',
    Mascotas: '#00b894',
  };
  if (COLOR_OVERRIDES[name]) return COLOR_OVERRIDES[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function formatMoney(amount) {
  const value = amount / 100;
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function formatMoneyShort(amount) {
  const value = Math.abs(amount) / 100;
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function formatDateFull(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
}

// ---- Date range calculation ----
function getDateRange() {
  if (period === 'custom') {
    const from = document.getElementById('date-from').value;
    const to = document.getElementById('date-to').value;
    if (from && to) return { start: from, end: to };
    return getMonthRange();
  }
  if (period === 'day') return getDayRange();
  if (period === 'week') return getWeekRange();
  if (period === 'month') return getMonthRange();
  if (period === 'year') return getYearRange();
  if (period === 'all') return { start: '2000-01-01', end: '2099-12-31' };
  return getMonthRange();
}

function getDayRange() {
  const d = toDateStr(currentDate);
  const next = new Date(currentDate);
  next.setDate(next.getDate() + 1);
  return { start: d, end: toDateStr(next) };
}

function getWeekRange() {
  const d = new Date(currentDate);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d);
  start.setDate(diff);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start: toDateStr(start), end: toDateStr(end) };
}

function getMonthRange() {
  const y = currentDate.getFullYear();
  const m = currentDate.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);
  return { start: toDateStr(start), end: toDateStr(end) };
}

function getYearRange() {
  const y = currentDate.getFullYear();
  return { start: y + '-01-01', end: y + 1 + '-01-01' };
}

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

// ---- Period label ----
function getPeriodLabel() {
  if (period === 'day') {
    return currentDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }
  if (period === 'week') {
    const { start, end } = getWeekRange();
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    e.setDate(e.getDate() - 1);
    return (
      s.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) +
      ' \u2013 ' +
      e.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }
  if (period === 'month') {
    return currentDate.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  }
  if (period === 'year') {
    return currentDate.getFullYear().toString();
  }
  if (period === 'all') {
    return 'Todo el historial';
  }
  if (period === 'custom') {
    const from = document.getElementById('date-from').value;
    const to = document.getElementById('date-to').value;
    if (from && to) {
      return (
        new Date(from + 'T00:00:00').toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
        }) +
        ' \u2013 ' +
        new Date(to + 'T00:00:00').toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    }
    return 'Selecciona fechas';
  }
  return '';
}

// ---- Navigation ----
function navigatePeriod(direction) {
  if (period === 'day') currentDate.setDate(currentDate.getDate() + direction);
  else if (period === 'week')
    currentDate.setDate(currentDate.getDate() + 7 * direction);
  else if (period === 'month')
    currentDate.setMonth(currentDate.getMonth() + direction);
  else if (period === 'year')
    currentDate.setFullYear(currentDate.getFullYear() + direction);
  saveState();
}

// ---- Sidebar ----
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('visible');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('visible');
}

function updateAccountCurrent() {
  const el = document.getElementById('sidebar-account-current');
  const name =
    selectedAccount === 'all'
      ? 'Todas las cuentas'
      : accounts.find((a) => a.id === selectedAccount)?.name || 'Todas';
  const icon = getAccountIcon(name);
  el.innerHTML =
    '<span class="account-icon">' +
    icon +
    '</span><span class="account-label">' +
    escapeHtml(name) +
    '</span><span class="account-currency">EUR</span><span class="dropdown-arrow">\u25BE</span>';

  // Update mobile top bar title with account info
  const titleEl = document.getElementById('app-title');
  if (titleEl) {
    titleEl.textContent = icon + ' ' + name;
  }
}

function buildAccountList() {
  const listEl = document.getElementById('sidebar-account-list');
  let html =
    '<div class="sidebar-account-item' +
    (selectedAccount === 'all' ? ' active' : '') +
    '" data-account="all"><span class="account-icon">\uD83C\uDFF7\uFE0F</span><span class="account-name">Todas las cuentas</span><span class="account-currency">EUR</span></div>';
  accounts
    .filter((a) => !a.closed)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((a) => {
      const icon = getAccountIcon(a.name);
      const active = selectedAccount === a.id ? ' active' : '';
      html +=
        '<div class="sidebar-account-item' +
        active +
        '" data-account="' +
        a.id +
        '"><span class="account-icon">' +
        icon +
        '</span><span class="account-name">' +
        escapeHtml(a.name) +
        '</span><span class="account-currency">EUR</span></div>';
    });
  listEl.innerHTML = html;

  listEl.querySelectorAll('.sidebar-account-item').forEach((item) => {
    item.addEventListener('click', () => {
      selectedAccount = item.dataset.account;
      saveState();
      updateAccountCurrent();
      listEl.classList.remove('open');
      closeSidebar();
      loadData();
    });
  });
}

// ---- Fetch ----
async function fetchAccounts() {
  const res = await fetch('/api/accounts');
  accounts = await res.json();
  buildAccountList();
  updateAccountCurrent();
}

async function fetchCategories() {
  const res = await fetch('/api/categories');
  const data = await res.json();
  categories = data.categories;
  categoryGroups = data.groups;
}

async function fetchTransactions() {
  const { start, end } = getDateRange();
  const params = new URLSearchParams({
    startDate: start,
    endDate: end,
    account: selectedAccount,
  });
  const res = await fetch('/api/transactions?' + params);
  transactions = await res.json();
}

async function fetchCarryOver() {
  const { start } = getDateRange();
  if (period === 'all') {
    carryOverBalance = 0;
    return;
  }
  const params = new URLSearchParams({
    upToDate: start,
    account: selectedAccount,
  });
  const res = await fetch('/api/balance?' + params);
  const data = await res.json();
  carryOverBalance = data.balance;
}

// ---- Render ----
function render() {
  document.getElementById('period-label').textContent = getPeriodLabel();

  const incomeGroupIds = new Set(
    categoryGroups.filter((g) => g.is_income).map((g) => g.id),
  );
  const incomeCatIds = new Set(
    categories.filter((c) => incomeGroupIds.has(c.group_id)).map((c) => c.id),
  );

  const relevant = transactions.filter((t) => {
    if (t.amount === 0) return false;
    if (selectedAccount === 'all' && t.transfer_id) return false;
    return true;
  });

  let totalIncome = 0;
  let totalExpense = 0;

  for (const t of relevant) {
    const catId = t.category || '__uncategorized__';
    const isIncomeCat = incomeCatIds.has(catId);
    const isIncome = isIncomeCat || t.amount > 0;
    if (isIncome) totalIncome += t.amount;
    else totalExpense += t.amount;
  }

  // Summary
  document.getElementById('carry-amount').textContent =
    formatMoney(carryOverBalance);
  document.getElementById('income-amount').textContent =
    formatMoney(totalIncome);
  document.getElementById('expense-amount').textContent = formatMoney(
    Math.abs(totalExpense),
  );
  const finalBalance = carryOverBalance + totalIncome + totalExpense;
  document.getElementById('balance-amount').textContent =
    formatMoneyShort(finalBalance);

  if (viewMode === 'category') {
    renderCategoryView(relevant, incomeCatIds);
  } else {
    renderDateView(relevant, incomeCatIds);
  }
}

function renderCategoryView(relevant, incomeCatIds) {
  const catData = {};
  for (const t of relevant) {
    const isIncomeCat = incomeCatIds.has(t.category);
    const isIncome = isIncomeCat || t.amount > 0;

    // For transfers, group by destination account
    let catId;
    if (t.transfer_acct_name) {
      catId = '__transfer__' + t.transfer_acct_name;
    } else {
      catId = t.category || '__uncategorized__';
    }

    let key;
    if (isIncomeCat) key = catId + ':income';
    else if (t.amount > 0) key = catId + ':income';
    else key = catId + ':expense';

    if (!catData[key])
      catData[key] = {
        catId,
        amount: 0,
        transactions: [],
        type: isIncome ? 'income' : 'expense',
      };
    catData[key].amount += t.amount;
    catData[key].transactions.push(t);
  }

  const incomeCategories = [];
  const expenseCategories = [];

  for (const [key, data] of Object.entries(catData)) {
    let name;
    if (data.catId.startsWith('__transfer__')) {
      const acctName = data.catId.replace('__transfer__', '');
      name = '\u2192 ' + acctName;
    } else if (data.catId === '__uncategorized__') {
      name = 'Sin categor\u00EDa';
    } else {
      const cat = categories.find((c) => c.id === data.catId);
      name = cat?.name || 'Sin categor\u00EDa';
    }
    const entry = {
      id: key,
      name,
      amount: data.amount,
      count: data.transactions.length,
      transactions: data.transactions.sort((a, b) =>
        b.date.localeCompare(a.date),
      ),
    };
    if (data.type === 'income') incomeCategories.push(entry);
    else expenseCategories.push(entry);
  }

  incomeCategories.sort((a, b) => b.amount - a.amount);
  expenseCategories.sort((a, b) => a.amount - b.amount);

  const contentEl = document.getElementById('content');
  let html = '';

  if (incomeCategories.length > 0) {
    html += '<div class="section-header income-header">Ingresos</div>';
    html += '<div class="category-list">';
    html += incomeCategories
      .map((cat) => renderCategory(cat, 'income'))
      .join('');
    html += '</div>';
  }

  if (expenseCategories.length > 0) {
    html += '<div class="section-header expense-header">Gastos</div>';
    html += '<div class="category-list">';
    html += expenseCategories
      .map((cat) => renderCategory(cat, 'expense'))
      .join('');
    html += '</div>';
  }

  if (incomeCategories.length === 0 && expenseCategories.length === 0) {
    html = '<div class="empty">No hay movimientos en este periodo</div>';
  }

  contentEl.innerHTML = html;

  contentEl.querySelectorAll('.category-item').forEach((item) => {
    item.querySelector('.category-header').addEventListener('click', () => {
      item.classList.toggle('open');
      item.querySelector('.category-transactions').classList.toggle('open');
    });
  });
}

function renderDateView(relevant, incomeCatIds) {
  // Group by date
  const dateGroups = {};
  for (const t of relevant) {
    if (!dateGroups[t.date]) dateGroups[t.date] = [];
    dateGroups[t.date].push(t);
  }

  const sortedDates = Object.keys(dateGroups).sort((a, b) =>
    b.localeCompare(a),
  );

  const contentEl = document.getElementById('content');
  if (sortedDates.length === 0) {
    contentEl.innerHTML =
      '<div class="empty">No hay movimientos en este periodo</div>';
    return;
  }

  let html = '';
  for (const date of sortedDates) {
    const txs = dateGroups[date];
    const total = txs.reduce((sum, t) => sum + t.amount, 0);
    const amtClass = total < 0 ? 'expense' : total > 0 ? 'income' : 'mixed';
    const label = formatDateFull(date);

    let txHtml = '';
    for (const t of txs) {
      const cat = categories.find((c) => c.id === t.category);
      let catName = t.transfer_acct_name
        ? '\u2192 ' + t.transfer_acct_name
        : cat?.name || 'Sin categor\u00EDa';
      const payee = t.transfer_acct_name
        ? t.notes || '\u2014'
        : t.payee_name || t.notes || '\u2014';
      const dotClass = t.amount < 0 ? 'expense' : 'income';
      const amtTxClass = t.amount < 0 ? 'expense' : 'income';
      txHtml +=
        '<div class="date-tx-item" data-tx-id="' +
        t.id +
        '"><span class="date-tx-dot ' +
        dotClass +
        '"></span><span class="date-tx-category">' +
        escapeHtml(catName) +
        '</span><span class="date-tx-payee">' +
        escapeHtml(payee) +
        '</span><span class="date-tx-amount ' +
        amtTxClass +
        '">' +
        formatMoneyShort(t.amount) +
        '</span></div>';
    }

    html +=
      '<div class="date-group"><div class="date-group-header"><div class="date-group-left"><span class="date-group-chevron">\u25B6</span><span class="date-group-label">' +
      label +
      '</span><span class="date-group-count">' +
      txs.length +
      '</span></div><span class="date-group-amount ' +
      amtClass +
      '">' +
      formatMoneyShort(total) +
      '</span></div><div class="date-group-transactions">' +
      txHtml +
      '</div></div>';
  }

  contentEl.innerHTML = html;

  contentEl.querySelectorAll('.date-group').forEach((group) => {
    group.querySelector('.date-group-header').addEventListener('click', () => {
      group.classList.toggle('open');
    });
  });
}

function renderCategory(cat, type) {
  const color = getColor(cat.name);
  const icon = getIcon(cat.name);

  let txHtml = cat.transactions
    .map((t) => {
      const payee = t.transfer_acct_name
        ? t.notes || '\u2014'
        : t.payee_name || t.notes || '\u2014';
      const amtClass = t.amount < 0 ? 'expense' : 'income';
      return (
        '<div class="transaction-item" data-tx-id="' +
        t.id +
        '"><span class="transaction-dot ' +
        amtClass +
        '"></span><span class="transaction-amount ' +
        amtClass +
        '">' +
        formatMoneyShort(t.amount) +
        '</span><span class="transaction-payee">' +
        escapeHtml(payee) +
        '</span><span class="transaction-date">' +
        formatDateShort(t.date) +
        '</span></div>'
      );
    })
    .join('');

  return (
    '<div class="category-item"><div class="category-header"><span class="category-chevron">\u25B6</span><div class="category-icon" style="background:' +
    color +
    '22;color:' +
    color +
    '">' +
    icon +
    '</div><div class="category-info"><span class="category-name">' +
    escapeHtml(cat.name) +
    '<span class="category-count">' +
    cat.count +
    '</span></span><span class="category-amount ' +
    type +
    '">' +
    formatMoneyShort(cat.amount) +
    '</span></div></div><div class="category-transactions">' +
    txHtml +
    '</div></div>'
  );
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Expand / Collapse all ----
function expandAll() {
  const contentEl = document.getElementById('content');
  if (viewMode === 'category') {
    contentEl.querySelectorAll('.category-item').forEach((item) => {
      item.classList.add('open');
      item.querySelector('.category-transactions').classList.add('open');
    });
  } else {
    contentEl.querySelectorAll('.date-group').forEach((group) => {
      group.classList.add('open');
    });
  }
}

function collapseAll() {
  const contentEl = document.getElementById('content');
  if (viewMode === 'category') {
    contentEl.querySelectorAll('.category-item').forEach((item) => {
      item.classList.remove('open');
      item.querySelector('.category-transactions').classList.remove('open');
    });
  } else {
    contentEl.querySelectorAll('.date-group').forEach((group) => {
      group.classList.remove('open');
    });
  }
}

// ---- Events ----
document.getElementById('prev-period').addEventListener('click', () => {
  navigatePeriod(-1);
  loadDataWithAnimation('right');
});
document.getElementById('next-period').addEventListener('click', () => {
  navigatePeriod(1);
  loadDataWithAnimation('left');
});

// Today button -> go to current period
document.getElementById('today-btn').addEventListener('click', () => {
  currentDate = new Date();
  saveState();
  loadData();
});

// Period label click -> date picker
const periodLabel = document.getElementById('period-label');
const periodDatePicker = document.getElementById('period-date-picker');

periodLabel.addEventListener('click', () => {
  periodDatePicker.value = toDateStr(currentDate);
  periodDatePicker.showPicker
    ? periodDatePicker.showPicker()
    : periodDatePicker.click();
});

periodDatePicker.addEventListener('change', () => {
  const val = periodDatePicker.value;
  if (!val) return;
  currentDate = new Date(val + 'T00:00:00');
  saveState();
  loadData();
});

// Swipe gestures
(function initSwipe() {
  const container = document.getElementById('swipe-container');
  let startX = 0;
  let startY = 0;
  let tracking = false;

  container.addEventListener(
    'touchstart',
    (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      tracking = true;
    },
    { passive: true },
  );

  container.addEventListener(
    'touchend',
    (e) => {
      if (!tracking) return;
      tracking = false;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      // Only trigger if horizontal swipe is dominant and > 60px
      if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
        if (period === 'all' || period === 'custom') return;
        if (diffX > 0) {
          // Swipe right -> previous period
          navigatePeriod(-1);
          loadDataWithAnimation('right');
        } else {
          // Swipe left -> next period
          navigatePeriod(1);
          loadDataWithAnimation('left');
        }
      }
    },
    { passive: true },
  );
})();

// Sidebar toggle
document.getElementById('menu-btn').addEventListener('click', openSidebar);
document.getElementById('app-title').addEventListener('click', () => {
  openSidebar();
  document.getElementById('sidebar-account-list').classList.add('open');
});
document
  .getElementById('drawer-overlay')
  .addEventListener('click', closeSidebar);

// Account dropdown in sidebar
document
  .getElementById('sidebar-account-current')
  .addEventListener('click', () => {
    document.getElementById('sidebar-account-list').classList.toggle('open');
  });

// Period buttons in sidebar
// Sync period button active state from restored state
document.querySelectorAll('.sidebar-period-btn').forEach((b) => {
  b.classList.toggle('active', b.dataset.period === period);
});

document.querySelectorAll('.sidebar-period-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('.sidebar-period-btn')
      .forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    period = btn.dataset.period;
    saveState();
    const customDates = document.getElementById('custom-dates');
    if (period === 'custom') {
      customDates.classList.add('visible');
    } else {
      customDates.classList.remove('visible');
      closeSidebar();
      loadData();
    }
  });
});

document.getElementById('apply-custom').addEventListener('click', () => {
  closeSidebar();
  loadData();
});

// View toggle
document.getElementById('view-category').addEventListener('click', () => {
  viewMode = 'category';
  document.getElementById('view-category').classList.add('active');
  document.getElementById('view-date').classList.remove('active');
  render();
});

document.getElementById('view-date').addEventListener('click', () => {
  viewMode = 'date';
  document.getElementById('view-date').classList.add('active');
  document.getElementById('view-category').classList.remove('active');
  render();
});

// Expand / Collapse
document.getElementById('expand-all').addEventListener('click', expandAll);
document.getElementById('collapse-all').addEventListener('click', collapseAll);

// Search modal
function openSearchModal() {
  document.getElementById('search-modal-overlay').classList.add('visible');
  setTimeout(() => document.getElementById('search-input').focus(), 100);
}

function closeSearchModal() {
  document.getElementById('search-modal-overlay').classList.remove('visible');
}

document
  .getElementById('search-btn')
  .addEventListener('click', openSearchModal);
document
  .getElementById('search-modal-close')
  .addEventListener('click', closeSearchModal);
document
  .getElementById('search-modal-overlay')
  .addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSearchModal();
  });
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'Escape' &&
    document
      .getElementById('search-modal-overlay')
      .classList.contains('visible')
  ) {
    closeSearchModal();
  }
});

async function performSearch() {
  const query = document.getElementById('search-input').value.trim();
  const resultsEl = document.getElementById('search-results');
  if (!query) {
    resultsEl.innerHTML = '';
    return;
  }
  resultsEl.innerHTML =
    '<div class="loading"><div class="spinner"></div>Buscando\u2026</div>';
  const params = new URLSearchParams({ q: query });
  const res = await fetch('/api/search?' + params);
  const results = await res.json();

  if (results.length === 0) {
    resultsEl.innerHTML = '<div class="empty">Sin resultados</div>';
    return;
  }

  resultsEl.innerHTML = results
    .map((t) => {
      const payee = t.transfer_acct_name
        ? t.notes || '\u2014'
        : t.payee_name || t.notes || '\u2014';
      const amtClass = t.amount < 0 ? 'expense' : 'income';
      const date = new Date(t.date + 'T00:00:00').toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return (
        '<div class="search-result-item" data-tx-id="' +
        t.id +
        '"><span class="sr-date">' +
        date +
        '</span><span class="sr-payee">' +
        escapeHtml(payee) +
        '</span><span class="sr-account">' +
        escapeHtml(t.account_name) +
        '</span><span class="sr-amount ' +
        amtClass +
        '">' +
        formatMoneyShort(t.amount) +
        '</span></div>'
      );
    })
    .join('');
}

document.getElementById('search-go').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});

async function loadData() {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML =
    '<div class="loading"><div class="spinner"></div>Cargando datos\u2026</div>';
  document.getElementById('period-label').textContent = getPeriodLabel();
  await Promise.all([fetchTransactions(), fetchCarryOver()]);
  render();
}

// Load with slide animation
async function loadDataWithAnimation(direction) {
  const contentEl = document.getElementById('content');

  // Slide out current content
  const outClass = direction === 'left' ? 'slide-out-left' : 'slide-out-right';
  contentEl.classList.add(outClass);

  // Wait for slide out animation
  await new Promise((r) => setTimeout(r, 250));

  // Show skeleton while loading
  contentEl.innerHTML =
    '<div class="loading"><div class="spinner"></div>Cargando datos\u2026</div>';
  document.getElementById('period-label').textContent = getPeriodLabel();

  // Prepare slide in from opposite side
  contentEl.classList.remove(outClass);
  const inClass = direction === 'left' ? 'slide-in-left' : 'slide-in-right';
  contentEl.classList.add(inClass);

  // Force reflow
  void contentEl.offsetWidth;

  // Remove the in-class to trigger transition back to center
  contentEl.classList.remove(inClass);

  // Fetch and render
  await Promise.all([fetchTransactions(), fetchCarryOver()]);
  render();
}

// ---- Sync ----
document.getElementById('sync-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sync-btn');
  const icon = btn.querySelector('.sync-icon');
  const status = document.getElementById('sync-status');
  btn.disabled = true;
  icon.classList.add('spinning');
  status.textContent = 'Sincronizando…';
  try {
    const resp = await fetch('/api/sync', { method: 'POST' });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Error');
    status.textContent =
      'Sincronizado ' + new Date(data.syncedAt).toLocaleTimeString('es-ES');
    // Reload all data
    await Promise.all([fetchAccounts(), fetchCategories()]);
    await Promise.all([fetchTransactions(), fetchCarryOver()]);
    render();
  } catch (err) {
    status.textContent = 'Error: ' + err.message;
  } finally {
    btn.disabled = false;
    icon.classList.remove('spinning');
  }
});

// ---- Init ----
(async () => {
  await Promise.all([fetchAccounts(), fetchCategories()]);
  await Promise.all([fetchTransactions(), fetchCarryOver()]);
  render();
})();

// ---- Transaction click to edit ----
document.addEventListener('click', (e) => {
  const item = e.target.closest('[data-tx-id]');
  if (!item) return;
  e.stopPropagation();
  const id = item.getAttribute('data-tx-id');
  if (id) {
    // Find the transaction in loaded data
    const tx = transactions.find((t) => t.id === id);
    if (tx) openEditTxModal(tx);
  }
});

// ---- New Transaction Modal ----
let payeesList = [];
let editingTxId = null;
let editingTx = null;
let formInitialState = null;

async function fetchPayees() {
  const res = await fetch('/api/payees');
  payeesList = await res.json();
}

function getFormState() {
  return {
    date: document.getElementById('newtx-date').value,
    type: document.getElementById('newtx-type').value,
    account: document.getElementById('newtx-account-value').value,
    amount: document.getElementById('newtx-amount').value,
    category: document.getElementById('newtx-category-value').value,
    dest: document.getElementById('newtx-dest-value').value,
    payee: document.getElementById('newtx-payee-input').value.trim(),
  };
}

function hasFormChanged() {
  if (!formInitialState) {
    // New transaction mode: check if anything is filled beyond defaults
    const amount = document.getElementById('newtx-amount').value;
    const category = document.getElementById('newtx-category-value').value;
    const dest = document.getElementById('newtx-dest-value').value;
    const payee = document.getElementById('newtx-payee-input').value.trim();
    return !!(amount || category || dest || payee);
  }
  // Edit mode: compare current state to initial
  const current = getFormState();
  return Object.keys(formInitialState).some(
    (k) => formInitialState[k] !== current[k],
  );
}

function setTxType(type) {
  const typeSelect = document.getElementById('newtx-type');
  typeSelect.value = type;
  const catField = document.getElementById('newtx-category-field');
  const destField = document.getElementById('newtx-dest-field');
  const catInput = document.getElementById('newtx-category-input');
  const destInput = document.getElementById('newtx-dest-input');

  if (type === 'transfer') {
    catField.style.display = 'none';
    destField.style.display = '';
    catInput.removeAttribute('required');
    destInput.setAttribute('required', '');
    catInput.setCustomValidity('');
  } else {
    catField.style.display = '';
    destField.style.display = 'none';
    catInput.setAttribute('required', '');
    destInput.removeAttribute('required');
    destInput.setCustomValidity('');
  }
}

function openNewTxModal() {
  editingTxId = null;
  editingTx = null;
  document.getElementById('newtx-title').textContent = 'Nueva transacción';
  document.getElementById('newtx-submit').textContent = 'Guardar transacción';
  document.getElementById('newtx-delete').style.display = 'none';

  const overlay = document.getElementById('newtx-overlay');
  overlay.classList.add('visible');
  document.body.classList.add('modal-open');

  // Set default date to today
  document.getElementById('newtx-date').value = toDateStr(new Date());

  // Default type: expense
  setTxType('expense');

  // Set default account to currently viewed account
  const acctInput = document.getElementById('newtx-account-input');
  const acctValue = document.getElementById('newtx-account-value');
  if (selectedAccount !== 'all') {
    const acct = accounts.find((a) => a.id === selectedAccount);
    if (acct) {
      acctInput.value = getAccountIcon(acct.name) + ' ' + acct.name;
      acctInput.classList.add('selected');
      acctValue.value = acct.id;
      acctInput.setCustomValidity('');
    }
  } else {
    acctInput.value = '';
    acctInput.classList.remove('selected');
    acctValue.value = '';
    acctInput.setCustomValidity('Selecciona una cuenta');
  }

  // Clear other fields
  document.getElementById('newtx-amount').value = '';
  document.getElementById('newtx-category-input').value = '';
  document.getElementById('newtx-category-input').classList.remove('selected');
  document.getElementById('newtx-category-value').value = '';
  document
    .getElementById('newtx-category-input')
    .setCustomValidity('Selecciona una categoría');
  document.getElementById('newtx-dest-input').value = '';
  document.getElementById('newtx-dest-input').classList.remove('selected');
  document.getElementById('newtx-dest-value').value = '';
  document.getElementById('newtx-payee-input').value = '';

  // Focus amount field
  setTimeout(() => document.getElementById('newtx-amount').focus(), 200);

  // Fetch payees if not loaded
  if (payeesList.length === 0) fetchPayees();
}

function openEditTxModal(tx) {
  editingTxId = tx.id;
  editingTx = tx;
  document.getElementById('newtx-title').textContent = 'Editar transacción';
  document.getElementById('newtx-submit').textContent = 'Actualizar';
  document.getElementById('newtx-delete').style.display = '';

  const overlay = document.getElementById('newtx-overlay');
  overlay.classList.add('visible');
  document.body.classList.add('modal-open');

  // Date
  document.getElementById('newtx-date').value = tx.date;

  // Determine type
  const isTransfer = !!tx.transfer_acct_name;
  const isIncome = !isTransfer && tx.amount > 0;
  const type = isTransfer ? 'transfer' : isIncome ? 'income' : 'expense';
  setTxType(type);

  // Account
  const acctInput = document.getElementById('newtx-account-input');
  const acctValue = document.getElementById('newtx-account-value');
  const acct = accounts.find((a) => a.id === tx.account_id);
  if (acct) {
    acctInput.value = getAccountIcon(acct.name) + ' ' + acct.name;
    acctInput.classList.add('selected');
    acctValue.value = acct.id;
    acctInput.setCustomValidity('');
  }

  // Amount (always positive in the field)
  document.getElementById('newtx-amount').value = (
    Math.abs(tx.amount) / 100
  ).toFixed(2);

  // Category or transfer destination
  if (isTransfer) {
    const destAcct = accounts.find((a) => a.name === tx.transfer_acct_name);
    const destInput = document.getElementById('newtx-dest-input');
    const destValue = document.getElementById('newtx-dest-value');
    if (destAcct) {
      destInput.value = getAccountIcon(destAcct.name) + ' ' + destAcct.name;
      destInput.classList.add('selected');
      destValue.value = destAcct.id;
      destInput.setCustomValidity('');
    }
    document.getElementById('newtx-category-input').value = '';
    document.getElementById('newtx-category-value').value = '';
  } else {
    const cat = categories.find((c) => c.id === tx.category);
    const catInput = document.getElementById('newtx-category-input');
    const catValue = document.getElementById('newtx-category-value');
    if (cat) {
      catInput.value = getIcon(cat.name) + ' ' + cat.name;
      catInput.classList.add('selected');
      catValue.value = cat.id;
      catInput.setCustomValidity('');
    } else {
      catInput.value = '';
      catInput.classList.remove('selected');
      catValue.value = '';
      catInput.setCustomValidity('Selecciona una categoría');
    }
  }

  // Payee / description
  const payeeInput = document.getElementById('newtx-payee-input');
  if (isTransfer) {
    payeeInput.value = tx.notes || '';
  } else {
    payeeInput.value = tx.payee_name || tx.notes || '';
  }

  // Fetch payees if not loaded
  if (payeesList.length === 0) fetchPayees();

  // Snapshot initial state for dirty checking
  formInitialState = getFormState();
}

function closeNewTxModal(force) {
  if (!force && hasFormChanged()) {
    if (!confirm('¿Descartar los cambios?')) return;
  }
  document.getElementById('newtx-overlay').classList.remove('visible');
  document.body.classList.remove('modal-open');
  closeAllDropdowns();
  editingTxId = null;
  editingTx = null;
  formInitialState = null;
}

function closeAllDropdowns() {
  document
    .querySelectorAll('.newtx-dropdown')
    .forEach((d) => d.classList.remove('open'));
}

// Type change handler
document.getElementById('newtx-type').addEventListener('change', (e) => {
  setTxType(e.target.value);
  // Clear category selection since categories differ by type
  const catInput = document.getElementById('newtx-category-input');
  catInput.value = '';
  catInput.classList.remove('selected');
  document.getElementById('newtx-category-value').value = '';
  if (e.target.value !== 'transfer') {
    catInput.setCustomValidity('Selecciona una categoría');
  }
});

// FAB opens modal
document.getElementById('fab-new').addEventListener('click', (e) => {
  e.preventDefault();
  openNewTxModal();
});

// Close modal
document
  .getElementById('newtx-close')
  .addEventListener('click', () => closeNewTxModal());
let overlayMouseDownTarget = null;
document.getElementById('newtx-overlay').addEventListener('mousedown', (e) => {
  overlayMouseDownTarget = e.target;
});
document.getElementById('newtx-overlay').addEventListener('click', (e) => {
  if (
    e.target === e.currentTarget &&
    overlayMouseDownTarget === e.currentTarget
  ) {
    closeNewTxModal();
  }
});

// ---- Filterable dropdown logic ----

function setupFilterable(inputId, dropdownId, valueId, getItems, onSelect) {
  const input = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const hiddenValue = valueId ? document.getElementById(valueId) : null;
  let highlighted = -1;

  function renderDropdown(filter) {
    const items = getItems(filter);
    if (items.length === 0) {
      dropdown.classList.remove('open');
      return;
    }
    highlighted = -1;
    let html = '';
    let currentGroup = null;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.group && item.group !== currentGroup) {
        currentGroup = item.group;
        html +=
          '<div class="newtx-dropdown-group">' +
          escapeHtml(currentGroup) +
          '</div>';
      }
      html +=
        '<div class="newtx-dropdown-item" data-index="' +
        i +
        '" data-id="' +
        (item.id || '') +
        '" data-label="' +
        escapeHtml(item.label) +
        '"><span class="dd-icon">' +
        (item.icon || '') +
        '</span><span class="dd-label">' +
        escapeHtml(item.label) +
        '</span></div>';
    }
    dropdown.innerHTML = html;
    dropdown.classList.add('open');

    dropdown.querySelectorAll('.newtx-dropdown-item').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        const label = el.dataset.label;
        const icon = el.querySelector('.dd-icon')?.textContent || '';
        input.value = icon ? icon + ' ' + label : label;
        input.classList.add('selected');
        if (hiddenValue) hiddenValue.value = id;
        input.setCustomValidity('');
        dropdown.classList.remove('open');
        if (onSelect) onSelect(id, label);
      });
    });
  }

  input.addEventListener('focus', () => {
    renderDropdown(input.classList.contains('selected') ? '' : input.value);
  });

  input.addEventListener('input', () => {
    input.classList.remove('selected');
    if (hiddenValue) {
      hiddenValue.value = '';
      input.setCustomValidity('Selecciona una opción de la lista');
    }
    renderDropdown(input.value);
  });

  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.newtx-dropdown-item');
    if (!dropdown.classList.contains('open') || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlighted = Math.min(highlighted + 1, items.length - 1);
      items.forEach((el, i) =>
        el.classList.toggle('highlighted', i === highlighted),
      );
      items[highlighted]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlighted = Math.max(highlighted - 1, 0);
      items.forEach((el, i) =>
        el.classList.toggle('highlighted', i === highlighted),
      );
      items[highlighted]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlighted >= 0 && items[highlighted]) {
        items[highlighted].click();
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('open');
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (
      !e.target.closest('#' + inputId) &&
      !e.target.closest('#' + dropdownId)
    ) {
      dropdown.classList.remove('open');
    }
  });
}

// Account filterable
setupFilterable(
  'newtx-account-input',
  'newtx-account-dropdown',
  'newtx-account-value',
  (filter) => {
    const f = filter
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return accounts
      .filter((a) => !a.closed)
      .filter(
        (a) =>
          !f ||
          a.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(f),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => ({ id: a.id, label: a.name, icon: getAccountIcon(a.name) }));
  },
);

// Destination account filterable (for transfers)
setupFilterable(
  'newtx-dest-input',
  'newtx-dest-dropdown',
  'newtx-dest-value',
  (filter) => {
    const f = filter
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return accounts
      .filter((a) => !a.closed)
      .filter(
        (a) =>
          !f ||
          a.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(f),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((a) => ({ id: a.id, label: a.name, icon: getAccountIcon(a.name) }));
  },
);

// Category filterable
setupFilterable(
  'newtx-category-input',
  'newtx-category-dropdown',
  'newtx-category-value',
  (filter) => {
    const f = filter
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    const txType = document.getElementById('newtx-type').value;
    const isIncome = txType === 'income';
    // Allow the current transaction's category even if hidden
    const editingCatId = editingTx ? editingTx.category : null;
    const items = [];
    const sortedGroups = [...categoryGroups]
      .filter((g) => (isIncome ? g.is_income : !g.is_income))
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const group of sortedGroups) {
      const groupCats = categories
        .filter((c) => c.group_id === group.id)
        .filter((c) => !c.hidden || c.id === editingCatId)
        .filter(
          (c) =>
            !f ||
            c.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .includes(f),
        )
        .sort((a, b) => a.name.localeCompare(b.name));
      for (const cat of groupCats) {
        items.push({
          id: cat.id,
          label: cat.name,
          icon: getIcon(cat.name),
          group: group.name,
        });
      }
    }
    return items;
  },
);

// Payee filterable
setupFilterable(
  'newtx-payee-input',
  'newtx-payee-dropdown',
  null,
  (filter) => {
    const f = filter
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return payeesList
      .filter(
        (p) =>
          !f ||
          p.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .includes(f),
      )
      .slice(0, 50)
      .map((p) => ({ id: p.id, label: p.name, icon: '' }));
  },
  (id, label) => {
    document.getElementById('newtx-payee-input').value = label;
  },
);

// Form submission
document.getElementById('newtx-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const txType = document.getElementById('newtx-type').value;
  const isTransfer = txType === 'transfer';

  // Sync custom validity for filterable selects
  const acctInput = document.getElementById('newtx-account-input');
  acctInput.setCustomValidity(
    document.getElementById('newtx-account-value').value
      ? ''
      : 'Selecciona una cuenta',
  );

  if (isTransfer) {
    const destInput = document.getElementById('newtx-dest-input');
    destInput.setCustomValidity(
      document.getElementById('newtx-dest-value').value
        ? ''
        : 'Selecciona una cuenta destino',
    );
  } else {
    const catInput = document.getElementById('newtx-category-input');
    catInput.setCustomValidity(
      document.getElementById('newtx-category-value').value
        ? ''
        : 'Selecciona una categoría',
    );
  }

  const form = document.getElementById('newtx-form');
  if (!form.reportValidity()) return;

  const btn = document.getElementById('newtx-submit');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  try {
    const accountId = document.getElementById('newtx-account-value').value;
    const date = document.getElementById('newtx-date').value;
    const amountRaw = parseFloat(document.getElementById('newtx-amount').value);
    const payeeInput = document
      .getElementById('newtx-payee-input')
      .value.trim();

    // Convert to cents with correct sign
    let amountCents = Math.round(Math.abs(amountRaw) * 100);
    if (txType === 'expense') {
      amountCents = -amountCents;
    } else if (txType === 'transfer') {
      amountCents = -amountCents; // outflow from source account
    }
    // income stays positive

    let body;
    if (isTransfer) {
      const destId = document.getElementById('newtx-dest-value').value;
      body = {
        account_id: accountId,
        date: date,
        amount: amountCents,
        transfer_dest_id: destId,
        notes: payeeInput || undefined,
      };
    } else {
      const categoryId = document.getElementById('newtx-category-value').value;
      body = {
        account_id: accountId,
        date: date,
        amount: amountCents,
        category: categoryId || undefined,
        payee_name: payeeInput || undefined,
        notes: payeeInput || undefined,
      };
    }

    let resp;
    if (editingTxId) {
      resp = await fetch('/api/transactions/' + editingTxId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } else {
      resp = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    }

    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Error al guardar');

    closeNewTxModal(true);
    await loadData();
    fetchPayees();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = editingTxId ? 'Actualizar' : 'Guardar transacción';
  }
});

// Delete transaction
document.getElementById('newtx-delete').addEventListener('click', async () => {
  if (!editingTxId) return;

  const isTransfer = !!editingTx?.transfer_acct_name;
  const msg = isTransfer
    ? '¿Eliminar esta transferencia? Se eliminará también la contrapartida.'
    : '¿Eliminar esta transacción?';

  if (!confirm(msg)) return;

  const btn = document.getElementById('newtx-delete');
  btn.disabled = true;
  btn.textContent = 'Eliminando…';

  try {
    // If it's a transfer, delete the linked transaction too
    if (isTransfer && editingTx.transfer_id) {
      await fetch('/api/transactions/' + editingTx.transfer_id, {
        method: 'DELETE',
      });
    }
    const resp = await fetch('/api/transactions/' + editingTxId, {
      method: 'DELETE',
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Error al eliminar');

    closeNewTxModal(true);
    await loadData();
  } catch (err) {
    alert('Error: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Eliminar transacción';
  }
});

// Prevent accidental navigation (Android back button) while modal is open
window.addEventListener('beforeunload', (e) => {
  if (document.getElementById('newtx-overlay').classList.contains('visible')) {
    e.preventDefault();
    e.returnValue = '';
  }
});
