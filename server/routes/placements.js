const express = require('express');
const router = express.Router();
const Placement = require('../models/placement');

const ADMIN_EMAIL = 'maharajmanasa@gmail.com';

// Submit a placement
router.post('/', async (req, res) => {
  try {
    const placement = new Placement({...req.body, approved: false});
    await placement.save();
    res.json({ message: 'Submitted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all approved placements
router.get('/', async (req, res) => {
  try {
    const placements = await Placement.find({ approved: true });
    res.json(placements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin - get all placements
router.get('/admin', async (req, res) => {
  const { email } = req.query;
  if (email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Unauthorized' });
  try {
    const placements = await Placement.find({});
    res.json(placements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin - approve
router.put('/admin/approve/:id', async (req, res) => {
  const { email } = req.query;
  if (email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Unauthorized' });
  try {
    await Placement.findByIdAndUpdate(req.params.id, { approved: true });
    res.json({ message: 'Approved!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin - delete
router.delete('/admin/delete/:id', async (req, res) => {
  const { email } = req.query;
  if (email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Unauthorized' });
  try {
    await Placement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
