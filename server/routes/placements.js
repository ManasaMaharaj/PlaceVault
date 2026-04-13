const express = require('express');
const router = express.Router();
const Placement = require('../models/placement');

// Submit a placement
router.post('/', async (req, res) => {
  try {
    const placement = new Placement(req.body);
    await placement.save();
    res.json({ message: 'Submitted successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all approved placements
router.get('/', async (req, res) => {
  try {
    const placements = await Placement.find({});
    res.json(placements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
