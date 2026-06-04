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
  Salary: '\uD83D\uDCB0',
  Sueldo: '\uD83D\uDCB0',
  'N\u00F3mina': '\uD83D\uDCB0',
  Food: '\uD83C\uDF54',
  Comida: '\uD83C\uDF54',
  'Alimentaci\u00F3n': '\uD83D\uDED2',
  Groceries: '\uD83D\uDED2',
  Supermercado: '\uD83D\uDED2',
  Transport: '\uD83D\uDE97',
  Transporte: '\uD83D\uDE97',
  Gasolina: '\u26FD',
  Entertainment: '\uD83C\uDFAC',
  Ocio: '\uD83C\uDFAC',
  Entretenimiento: '\uD83C\uDFAC',
  Shopping: '\uD83D\uDECD\uFE0F',
  Compras: '\uD83D\uDECD\uFE0F',
  Ropa: '\uD83D\uDC55',
  Health: '\uD83D\uDC8A',
  Salud: '\uD83D\uDC8A',
  'M\u00E9dico': '\uD83C\uDFE5',
  Home: '\uD83C\uDFE0',
  Casa: '\uD83C\uDFE0',
  Hogar: '\uD83C\uDFE0',
  Alquiler: '\uD83C\uDFE0',
  Hipoteca: '\uD83C\uDFE0',
  Bills: '\uD83C\uDFF7\uFE0F',
  Facturas: '\uD83D\uDCC4',
  Suscripciones: '\uD83D\uDCF1',
  Education: '\uD83D\uDCDA',
  'Educaci\u00F3n': '\uD83D\uDCDA',
  Travel: '\u2708\uFE0F',
  Viajes: '\u2708\uFE0F',
  Gifts: '\uD83C\uDF81',
  Regalos: '\uD83C\uDF81',
  Sports: '\uD83C\uDFCB\uFE0F',
  Deporte: '\uD83C\uDFCB\uFE0F',
  Pets: '\uD83D\uDC3E',
  Mascotas: '\uD83D\uDC3E',
  Gabi: '\uD83D\uDC36',
  Transfers: '\u21C4',
  Transferencias: '\u21C4',
  Inversiones: '\uD83D\uDCC8',
  Investment: '\uD83D\uDCC8',
  Restaurantes: '\uD83C\uDF7D\uFE0F',
  Restaurant: '\uD83C\uDF7D\uFE0F',
  'Eating out': '\uD83C\uDF7D\uFE0F',
  'Eating Out': '\uD83C\uDF7D\uFE0F',
  Taxi: '\uD83D\uDE95',
  Car: '\uD83D\uDE97',
  Coche: '\uD83D\uDE97',
  Communications: '\uD83D\uDCF1',
  Comunicaciones: '\uD83D\uDCF1',
  Ajustes: '\u2699\uFE0F',
  Settings: '\u2699\uFE0F',
  'Caf\u00E9': '\u2615',
  Coffee: '\u2615',
  Pagado: '\uD83D\uDE0A',
};

function getIcon(name) {
  if (ICONS[name]) return ICONS[name];
  const nameLower = name.toLowerCase();
  for (const [key, icon] of Object.entries(ICONS)) {
    const re = new RegExp('\\b' + key.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    if (re.test(nameLower)) return icon;
  }
  if (name.startsWith('\u2192 ') || name.startsWith('To ') || name.startsWith('From ')) return '\u21C4';
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
        ? (t.notes || '\u2014')
        : (t.payee_name || t.notes || '\u2014');
      const dotClass = t.amount < 0 ? 'expense' : 'income';
      const amtTxClass = t.amount < 0 ? 'expense' : 'income';
      txHtml +=
        '<div class="date-tx-item" data-tx-id="' + t.id + '"><span class="date-tx-dot ' +
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
        ? (t.notes || '\u2014')
        : (t.payee_name || t.notes || '\u2014');
      const amtClass = t.amount < 0 ? 'expense' : 'income';
      return (
        '<div class="transaction-item" data-tx-id="' + t.id + '"><span class="transaction-dot ' +
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
        ? (t.notes || '\u2014')
        : (t.payee_name || t.notes || '\u2014');
      const amtClass = t.amount < 0 ? 'expense' : 'income';
      const date = new Date(t.date + 'T00:00:00').toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return (
        '<div class="search-result-item" data-tx-id="' + t.id + '"><span class="sr-date">' +
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

// ---- Transaction click to edit in Actual Budget ----
document.addEventListener('click', (e) => {
  const item = e.target.closest('[data-tx-id]');
  if (!item) return;
  e.stopPropagation();
  const id = item.getAttribute('data-tx-id');
  if (id) {
    window.open('https://money.dpsconsulting.es/transactions/' + id, '_blank', 'noopener');
  }
});
