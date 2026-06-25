const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET all accounts
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create account
router.post('/', async (req, res) => {
  const { name, type, user_id } = req.body;
  if (!name || !type || !user_id)
    return res.status(400).json({ error: 'name, type, and user_id are required' });

  const { data, error } = await supabase
    .from('accounts')
    .insert({ name, type, user_id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update account
router.put('/:id', async (req, res) => {
  const { name, type } = req.body;
  const { data, error } = await supabase
    .from('accounts')
    .update({ name, type })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE account
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Account deleted' });
});

module.exports = router;
