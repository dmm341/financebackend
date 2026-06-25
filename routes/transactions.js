const express = require('express');
const router = express.Router();
const { parse } = require('csv-parse/sync');
const crypto = require('crypto');
const supabase = require('../supabase');

// GET all transactions
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create transaction
router.post('/', async (req, res) => {
  const { account_id, category_id, user_id, type, amount, description, date } = req.body;
  if (!account_id || !category_id || !user_id || !type || !amount || !date)
    return res.status(400).json({ error: 'account_id, category_id, user_id, type, amount, and date are required' });

  const { data, error } = await supabase
    .from('transactions')
    .insert({ account_id, category_id, user_id, type, amount, description, date })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update transaction
router.put('/:id', async (req, res) => {
  const { type, amount, description, date } = req.body;
  const { data, error } = await supabase
    .from('transactions')
    .update({ type, amount, description, date })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Transaction deleted' });
});

// POST import transactions from CSV
router.post('/import', async (req, res) => {
  const { user_id, csv } = req.body;
  if (!user_id || !csv)
    return res.status(400).json({ error: 'user_id and csv are required' });

  let records;
  try {
    records = parse(csv, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (parseError) {
    return res.status(400).json({ error: 'Invalid CSV format: ' + parseError.message });
  }

  const required = ['account_id', 'category_id', 'type', 'amount', 'date'];
  const firstRow = records[0] || {};
  const missingHeaders = required.filter((h) => !(h in firstRow));
  if (missingHeaders.length > 0)
    return res.status(400).json({ error: `Missing CSV headers: ${missingHeaders.join(', ')}` });

  const toInsert = [];
  const skipped = [];

  for (const row of records) {
    const raw = `${row.account_id}|${row.category_id}|${row.type}|${row.amount}|${row.date}|${row.description || ''}`;
    const source_hash = crypto.createHash('sha256').update(raw).digest('hex');

    // Check for duplicate
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('source_hash', source_hash)
      .maybeSingle();

    if (existing) {
      skipped.push(row);
      continue;
    }

    toInsert.push({
      account_id: Number(row.account_id),
      category_id: Number(row.category_id),
      user_id: Number(user_id),
      type: row.type,
      amount: Number(row.amount),
      description: row.description || null,
      date: row.date,
      source_hash,
    });
  }

  if (toInsert.length === 0) {
    return res.json({ imported: 0, skipped: skipped.length, importedRows: [], message: 'All rows were duplicates or nothing to import.' });
  }

  const { data: importedRows, error: insertError } = await supabase
    .from('transactions')
    .insert(toInsert)
    .select();

  if (insertError) return res.status(500).json({ error: insertError.message });

  res.json({
    imported: importedRows.length,
    skipped: skipped.length,
    importedRows,
  });
});

module.exports = router;
