const express = require('express');
const { Insight } = require('../models/Compare');
const { protect } = require('../middleware/auth');
const graniteService = require('../services/granite');
const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/insights  – user's personalized insights
router.get('/', protect, async (req, res) => {
  try {
    const insights = await Insight.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('product', 'name thumbnail lowestPrice')
      .lean();
    res.json({ success: true, data: insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/insights/generate
router.post('/generate', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedProducts');
    const recentSearches = user.searchHistory.slice(-10).map(h => h.query);

    const aiInsights = await graniteService.generateInsights(user, user.savedProducts, recentSearches);

    const saved = await Insight.insertMany(
      aiInsights.map(i => ({ ...i, user: req.user._id }))
    );

    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/insights/:id/read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    await Insight.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
