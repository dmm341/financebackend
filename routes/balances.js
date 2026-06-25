const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET all opening balances
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('account_opening_balances')
    .select('*')
    .order('month', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST add opening balance
router.post('/', async (req, res) => {
  const { account_id, balance, month } = req.body;
  if (!account_id || balance === undefined || !month)
    return res.status(400).json({ error: 'account_id, balance, and month are required' });

  // Upsert: if a balance for this account+month exists, update it
  const { data: existing } = await supabase
    .from('account_opening_balances')
    .select('id')
    .eq('account_id', account_id)
    .eq('month', `${month}-01`)
    .maybeSingle();

  let result;
  if (existing) {
    const { data, error } = await supabase
      .from('account_opening_balances')
      .update({ balance })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    result = data;
  } else {
    const { data, error } = await supabase
      .from('account_opening_balances')
      .insert({ account_id, balance, month: `${month}-01` })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    result = data;
  }

  res.status(201).json(result);
});

// GET account balance report for a given month
// Returns: opening_balance, income, expense, current_balance
router.get('/account-balance', async (req, res) => {
  const { account_id, month } = req.query;
  if (!account_id || !month)
    return res.status(400).json({ error: 'account_id and month are required' });

  // Get opening balance for the month
  const { data: openingData } = await supabase
    .from('account_opening_balances')
    .select('balance')
    .eq('account_id', account_id)
    .eq('month', `${month}-01`)
    .maybeSingle();

  const opening_balance = openingData ? Number(openingData.balance) : 0;

  // Date range for the month
  const startDate = `${month}-01`;
  const [year, mon] = month.split('-');
  const endDate = new Date(Number(year), Number(mon), 0).toISOString().slice(0, 10); // last day of month

  // Get transactions for the account in this month
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('account_id', account_id)
    .gte('date', startDate)
    .lte('date', endDate);

  if (txError) return res.status(500).json({ error: txError.message });

  let income = 0;
  let expense = 0;
  for (const tx of transactions || []) {
    if (tx.type === 'IN') income += Number(tx.amount);
    else if (tx.type === 'OUT') expense += Number(tx.amount);
  }

  const current_balance = opening_balance + income - expense;

  res.json({
    account_id: Number(account_id),
    month,
    opening_balance,
    income,
    expense,
    current_balance,
  });
});

module.exports = router;
