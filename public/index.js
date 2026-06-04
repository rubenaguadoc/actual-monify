// ---- State ----
let currentDate = new Date();
let period = 'month'; // day, week, month, year, all, custom
let accounts = [];
let categories = [];
let categoryGroups = [];
let transactions = [];
let selectedAccount = 'all';
let carryOverBalance = 0;

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

const ICONS = {
  Salary: '💰',
  Sueldo: '💰',
  Nómina: '💰',
  Food: '🍔',
  Comida: '🍔',
  Alimentación: '🛒',
  Groceries: '🛒',
  Supermercado: '🛒',
  Transport: '🚗',
  Transporte: '🚗',
  Gasolina: '⛽',
  Entertainment: '🎬',
  Ocio: '🎬',
  Entretenimiento: '🎬',
  Shopping: '🛍️',
  Compras: '🛍️',
  Ropa: '👕',
  Health: '💊',
  Salud: '💊',
  Médico: '🏥',
  Home: '🏠',
  Casa: '🏠',
  Hogar: '🏠',
  Alquiler: '🏠',
  Hipoteca: '🏠',
  Bills: '📄',
  Facturas: '📄',
  Suscripciones: '📱',
  Education: '📚',
  Educación: '📚',
  Travel: '✈️',
  Viajes: '✈️',
  Gifts: '🎁',
  Regalos: '🎁',
  Sports: '🏋️',
  Deporte: '🏋️',
  Pets: '🐾',
  Mascotas: '🐾',
  Transfers: '↔️',
  Inversiones: '📈',
  Investment: '📈',
  Restaurantes: '🍽️',
  Restaurant: '🍽️',
  Café: '☕',
  Coffee: '☕',
};

function getIcon(name) {
  if (ICONS[name]) return ICONS[name];
  for (const [key, icon] of Object.entries(ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return icon;
  }
  return '📦';
}

function formatMoney(amount) {
  const value = amount / 100;
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
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
  return { start: `${y}-01-01`, end: `${y + 1}-01-01` };
}

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
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
    return `${s.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
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
      return `${new Date(from + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} – ${new Date(to + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    }
    return 'Selecciona fechas';
  }
  return '';
}

// ---- Navigation ----
function navigatePeriod(direction) {
  if (period === 'day') {
    currentDate.setDate(currentDate.getDate() + direction);
  } else if (period === 'week') {
    currentDate.setDate(currentDate.getDate() + 7 * direction);
  } else if (period === 'month') {
    currentDate.setMonth(currentDate.getMonth() + direction);
  } else if (period === 'year') {
    currentDate.setFullYear(currentDate.getFullYear() + direction);
  }
}

// ---- Fetch ----
async function fetchAccounts() {
  const res = await fetch('/api/accounts');
  accounts = await res.json();
  const select = document.getElementById('account-select');
  select.innerHTML = '<option value="all">Todas las cuentas</option>';
  accounts
    .filter((a) => !a.closed)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((a) => {
      const opt = document.createElement('option');
      opt.value = a.id;
      opt.textContent = a.name;
      select.appendChild(opt);
    });
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
  const res = await fetch(`/api/transactions?${params}`);
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
  const res = await fetch(`/api/balance?${params}`);
  const data = await res.json();
  carryOverBalance = data.balance;
}

// ---- Render ----
function render() {
  document.getElementById('period-label').textContent = getPeriodLabel();

  // Determine income categories
  const incomeGroupIds = new Set(
    categoryGroups.filter((g) => g.is_income).map((g) => g.id),
  );
  const incomeCatIds = new Set(
    categories.filter((c) => incomeGroupIds.has(c.group_id)).map((c) => c.id),
  );

  // Include all transactions, but when viewing all accounts,
  // exclude internal transfers (they cancel out)
  const relevant = transactions.filter((t) => {
    if (t.amount === 0) return false;
    // When viewing all accounts, skip transfers between own accounts
    if (selectedAccount === 'all' && t.transfer_id) return false;
    return true;
  });

  let totalIncome = 0;
  let totalExpense = 0;
  // catKey -> { amount, transactions[] }
  // For non-income categories, split into positive and negative buckets
  const catData = {};

  for (const t of relevant) {
    // Use a synthetic category id for uncategorized (off-budget transfers)
    const catId = t.category || '__uncategorized__';
    const isIncomeCat = incomeCatIds.has(catId);
    const isIncome = isIncomeCat || t.amount > 0;
    if (isIncome) {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }

    // For income-group categories, always group together
    // For other categories, split by sign so they appear in both sections if needed
    let key;
    if (isIncomeCat) {
      key = catId + ':income';
    } else if (t.amount > 0) {
      key = catId + ':income';
    } else {
      key = catId + ':expense';
    }

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
    formatMoney(finalBalance);

  // Build income and expense category lists
  const incomeCategories = [];
  const expenseCategories = [];

  for (const [key, data] of Object.entries(catData)) {
    const cat = categories.find((c) => c.id === data.catId);
    const name =
      data.catId === '__uncategorized__'
        ? 'Transfers'
        : cat?.name || 'Sin categoría';
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

  // Income section
  if (incomeCategories.length > 0) {
    const maxIncome = Math.max(
      ...incomeCategories.map((c) => Math.abs(c.amount)),
    );
    html += '<div class="section-header income-header">Ingresos</div>';
    html += '<div class="category-list">';
    html += incomeCategories
      .map((cat) => renderCategory(cat, maxIncome, 'income'))
      .join('');
    html += '</div>';
  }

  // Expense section
  if (expenseCategories.length > 0) {
    const maxExpense = Math.max(
      ...expenseCategories.map((c) => Math.abs(c.amount)),
    );
    html += '<div class="section-header expense-header">Gastos</div>';
    html += '<div class="category-list">';
    html += expenseCategories
      .map((cat) => renderCategory(cat, maxExpense, 'expense'))
      .join('');
    html += '</div>';
  }

  if (incomeCategories.length === 0 && expenseCategories.length === 0) {
    html = '<div class="empty">No hay movimientos en este periodo</div>';
  }

  contentEl.innerHTML = html;

  // Attach collapse listeners
  contentEl.querySelectorAll('.category-item').forEach((item) => {
    item.querySelector('.category-header').addEventListener('click', () => {
      item.classList.toggle('open');
      const txDiv = item.querySelector('.category-transactions');
      txDiv.classList.toggle('open');
    });
  });
}

function renderCategory(cat, maxAmount, type) {
  const color = getColor(cat.name);
  const icon = getIcon(cat.name);
  const pct = (Math.abs(cat.amount) / maxAmount) * 100;

  let txHtml = cat.transactions
    .map((t) => {
      const payee = t.payee_name || t.notes || '—';
      const amtClass = t.amount < 0 ? 'expense' : 'income';
      return `
          <div class="transaction-item">
            <span class="transaction-date">${formatDateShort(t.date)}</span>
            <span class="transaction-payee">${escapeHtml(payee)}</span>
            <span class="transaction-amount ${amtClass}">${formatMoney(Math.abs(t.amount))}</span>
          </div>`;
    })
    .join('');

  return `
        <div class="category-item">
          <div class="category-header">
            <div class="category-icon" style="background: ${color}22; color: ${color}">${icon}</div>
            <div class="category-info">
              <div class="category-name-row">
                <span class="category-name">${escapeHtml(cat.name)}<span class="category-count">${cat.count}</span></span>
                <span class="category-amount ${type}">${formatMoney(Math.abs(cat.amount))}</span>
              </div>
              <div class="category-bar-container">
                <div class="category-bar" style="width: ${pct}%; background: ${color}"></div>
              </div>
            </div>
            <span class="chevron">▶</span>
          </div>
          <div class="category-transactions">${txHtml}</div>
        </div>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- Events ----
document.getElementById('prev-period').addEventListener('click', () => {
  navigatePeriod(-1);
  loadData();
});

document.getElementById('next-period').addEventListener('click', () => {
  navigatePeriod(1);
  loadData();
});

document.getElementById('account-select').addEventListener('change', (e) => {
  selectedAccount = e.target.value;
  loadData();
});

document.querySelectorAll('.period-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document
      .querySelectorAll('.period-btn')
      .forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    period = btn.dataset.period;

    const customDates = document.getElementById('custom-dates');
    if (period === 'custom') {
      customDates.classList.add('visible');
    } else {
      customDates.classList.remove('visible');
      loadData();
    }
  });
});

document.getElementById('apply-custom').addEventListener('click', () => {
  loadData();
});

async function loadData() {
  const contentEl = document.getElementById('content');
  contentEl.innerHTML =
    '<div class="loading"><div class="spinner"></div>Cargando datos…</div>';
  document.getElementById('period-label').textContent = getPeriodLabel();
  await Promise.all([fetchTransactions(), fetchCarryOver()]);
  render();
}

// ---- Search ----
document.getElementById('search-btn').addEventListener('click', () => {
  const panel = document.getElementById('search-panel');
  const btn = document.getElementById('search-btn');
  const isVisible = panel.classList.toggle('visible');
  btn.classList.toggle('active', isVisible);
  if (isVisible) document.getElementById('search-input').focus();
});

async function performSearch() {
  const query = document.getElementById('search-input').value.trim();
  const resultsEl = document.getElementById('search-results');
  if (!query) {
    resultsEl.innerHTML = '';
    return;
  }
  resultsEl.innerHTML =
    '<div class="loading"><div class="spinner"></div>Buscando…</div>';
  const params = new URLSearchParams({ q: query });
  const res = await fetch(`/api/search?${params}`);
  const results = await res.json();

  if (results.length === 0) {
    resultsEl.innerHTML = '<div class="empty">Sin resultados</div>';
    return;
  }

  resultsEl.innerHTML = results
    .map((t) => {
      const payee = t.payee_name || t.notes || '—';
      const amtClass = t.amount < 0 ? 'expense' : 'income';
      const date = new Date(t.date + 'T00:00:00').toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return `
          <div class="search-result-item">
            <span class="sr-date">${date}</span>
            <span class="sr-payee">${escapeHtml(payee)}</span>
            <span class="sr-account">${escapeHtml(t.account_name)}</span>
            <span class="sr-amount ${amtClass}">${formatMoney(Math.abs(t.amount))}</span>
          </div>`;
    })
    .join('');
}

document.getElementById('search-go').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') performSearch();
});

// ---- Init ----
(async () => {
  await Promise.all([fetchAccounts(), fetchCategories()]);
  await Promise.all([fetchTransactions(), fetchCarryOver()]);
  render();
})();
