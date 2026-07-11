const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile
router.get('/profile', protect, (req, res) => {
  res.json({ success: true, data: req.user });
});

// PATCH /api/users/profile
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/save-product
router.post('/save-product', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user._id);
    const alreadySaved = user.savedProducts.includes(productId);

    if (alreadySaved) {
      user.savedProducts = user.savedProducts.filter(id => id.toString() !== productId);
    } else {
      user.savedProducts.push(productId);
    }
    await user.save();
    res.json({ success: true, saved: !alreadySaved, savedProducts: user.savedProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/saved-products
router.get('/saved-products', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedProducts');
    res.json({ success: true, data: user.savedProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/search-history
router.post('/search-history', protect, async (req, res) => {
  try {
    const { query } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      $push: { searchHistory: { $each: [{ query }], $slice: -20 } },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
