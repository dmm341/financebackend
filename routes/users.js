const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET all users
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create user
router.post('/', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });

  const { data, error } = await supabase
    .from('users')
    .insert({ name, email })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update user
router.put('/:id', async (req, res) => {
  const { name, email } = req.body;
  const { data, error } = await supabase
    .from('users')
    .update({ name, email })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE user
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'User deleted' });
});

module.exports = router;
