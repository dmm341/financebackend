const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// GET all categories
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST create category
router.post('/', async (req, res) => {
  const { name, type, user_id } = req.body;
  if (!name || !type || !user_id)
    return res.status(400).json({ error: 'name, type, and user_id are required' });

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, type, user_id })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// PUT update category
router.put('/:id', async (req, res) => {
  const { name, type } = req.body;
  const { data, error } = await supabase
    .from('categories')
    .update({ name, type })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE category
router.delete('/:id', async (req, res) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Category deleted' });
});

module.exports = router;
