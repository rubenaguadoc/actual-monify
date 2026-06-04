require('dotenv').config({ quiet: true });
const express = require('express');
const path = require('path');
const api = require('@actual-app/api');

const app = express();
const PORT = process.env.PORT || 3000;
const SYNC_INTERVAL_MS = (process.env.SYNC_INTERVAL_MINUTES || 5) * 60 * 1000;

let initialized = false;
let syncInterval = null;

async function ensureInit() {
  if (initialized) return;
  const dataDir = path.join(__dirname, 'actual-data');
  const serverURL = process.env.ACTUAL_SERVER_URL;
  const password = process.env.ACTUAL_PASSWORD;
  const syncId = process.env.ACTUAL_SYNC_ID;

  if (!serverURL) {
    throw new Error('ACTUAL_SERVER_URL env variable not set');
  }

  if (!password) {
    throw new Error('ACTUAL_PASSWORD env variable not set');
  }

  if (!syncId) {
    throw new Error('ACTUAL_SYNC_ID env variable not set');
  }

  await api.init({ dataDir, serverURL, password });
  await api.downloadBudget(syncId);
  initialized = true;

  // Periodic sync to pull remote changes
  syncInterval = setInterval(async () => {
    try {
      await api.sync();
      console.log(`[${new Date().toISOString()}] Synced with Actual server`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Sync failed:`, err.message);
    }
  }, SYNC_INTERVAL_MS);
}

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API: Get accounts
app.get('/api/accounts', async (req, res) => {
  try {
    await ensureInit();
    const accounts = await api.getAccounts();
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get categories
app.get('/api/categories', async (req, res) => {
  try {
    await ensureInit();
    const categories = await api.getCategories();
    const groups = await api.getCategoryGroups();
    res.json({ categories, groups });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: subtract one day from a YYYY-MM-DD string
function dayBefore(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// API: Get transactions for a date range, optionally filtered by account
// Query params: startDate (YYYY-MM-DD inclusive), endDate (YYYY-MM-DD exclusive), account (id or "all")
app.get('/api/transactions', async (req, res) => {
  try {
    await ensureInit();
    const { startDate, endDate, account } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ error: 'startDate and endDate params required (YYYY-MM-DD)' });
    }

    // Actual API uses inclusive endDate, so subtract one day
    const endInclusive = dayBefore(endDate);

    // Get all accounts and payees to resolve transfer destinations
    const accounts = await api.getAccounts();
    const accountMap = {};
    for (const a of accounts) accountMap[a.id] = a.name;

    const payees = await api.getPayees();
    const transferPayeeMap = {};
    const payeeNameMap = {};
    for (const p of payees) {
      if (p.transfer_acct) {
        transferPayeeMap[p.id] = accountMap[p.transfer_acct] || null;
      }
      payeeNameMap[p.id] = p.name || null;
    }

    let transactions = [];
    const targetAccounts =
      account && account !== 'all'
        ? accounts.filter((a) => a.id === account)
        : accounts;

    for (const acct of targetAccounts) {
      const txns = await api.getTransactions(acct.id, startDate, endInclusive);
      transactions.push(
        ...txns.map((t) => ({
          ...t,
          account_id: acct.id,
          account_name: acct.name,
          payee_name: payeeNameMap[t.payee] || null,
          transfer_acct_name: transferPayeeMap[t.payee] || null,
        })),
      );
    }

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get balance (sum of all transactions) up to a given date for given accounts
app.get('/api/balance', async (req, res) => {
  try {
    await ensureInit();
    const { upToDate, account } = req.query;

    if (!upToDate) {
      return res
        .status(400)
        .json({ error: 'upToDate param required (YYYY-MM-DD)' });
    }

    const accounts = await api.getAccounts();
    const targetAccounts =
      account && account !== 'all'
        ? accounts.filter((a) => a.id === account)
        : accounts;

    let total = 0;
    // upToDate is exclusive (first day of period), so get up to the day before
    const upToInclusive = dayBefore(upToDate);
    for (const acct of targetAccounts) {
      const txns = await api.getTransactions(
        acct.id,
        '2000-01-01',
        upToInclusive,
      );
      for (const t of txns) {
        total += t.amount;
      }
    }

    res.json({ balance: total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Search transactions by text (payee/notes) or amount across all accounts
app.get('/api/search', async (req, res) => {
  try {
    await ensureInit();
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const query = q
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    const accounts = await api.getAccounts();
    const accountMap = {};
    for (const a of accounts) accountMap[a.id] = a.name;

    const payees = await api.getPayees();
    const transferPayeeMap = {};
    const payeeNameMap = {};
    for (const p of payees) {
      if (p.transfer_acct) {
        transferPayeeMap[p.id] = accountMap[p.transfer_acct] || null;
      }
      payeeNameMap[p.id] = p.name || null;
    }
    const results = [];

    // Check if query looks like a number (supports comma as decimal separator)
    const numQuery = query.replace(',', '.');
    const queryAmount = parseFloat(numQuery);
    const isNumericSearch =
      !isNaN(queryAmount) && numQuery.match(/^\d+([.,]\d+)?$/);
    // Convert to cents for comparison
    const queryAmountCents = isNumericSearch
      ? Math.round(queryAmount * 100)
      : 0;

    for (const acct of accounts) {
      const txns = await api.getTransactions(
        acct.id,
        '2000-01-01',
        '2099-12-31',
      );
      for (const t of txns) {
        const resolvedPayeeName = payeeNameMap[t.payee] || '';
        const payee = resolvedPayeeName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const notes = (t.notes || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        const imported = (t.imported_payee || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        let match =
          payee.includes(query) ||
          notes.includes(query) ||
          imported.includes(query);

        // Also match by amount
        if (!match && isNumericSearch) {
          match = Math.abs(t.amount) === queryAmountCents;
        }

        if (match) {
          results.push({
            ...t,
            account_id: acct.id,
            account_name: acct.name,
            payee_name: resolvedPayeeName || null,
            transfer_acct_name: transferPayeeMap[t.payee] || null,
          });
        }
      }
    }

    // Sort by date descending
    results.sort((a, b) => b.date.localeCompare(a.date));
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Force sync with Actual server
app.post('/api/sync', async (req, res) => {
  try {
    await ensureInit();
    await api.sync();
    res.json({ ok: true, syncedAt: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  try {
    await ensureInit();
    console.log('Connected to Actual Budget');
  } catch (err) {
    console.error('Failed to connect:', err.message);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (syncInterval) clearInterval(syncInterval);
  try {
    await api.shutdown();
  } catch (_) {}
  process.exit(0);
});
