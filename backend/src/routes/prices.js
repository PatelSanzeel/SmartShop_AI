const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/prices/:productId/history
router.get('/:productId/history', async (req, res) => {
  try {
    const { store, days = 30 } = req.query;
    const product = await Product.findById(req.params.productId, 'priceHistory stores name').lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const since = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    let history = product.priceHistory.filter(h => new Date(h.timestamp) >= since);
    if (store) history = history.filter(h => h.store === store);

    // Group by store
    const byStore = {};
    history.forEach(h => {
      if (!byStore[h.store]) byStore[h.store] = [];
      byStore[h.store].push({ price: h.price, timestamp: h.timestamp });
    });

    // Current prices per store
    const currentPrices = product.stores.map(s => ({
      store: s.store,
      price: s.price,
      inStock: s.inStock,
      discount: s.discount,
    }));

    res.json({ success: true, data: { history, byStore, currentPrices, productName: product.name } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/prices/:productId/prediction
router.get('/:productId/prediction', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId, 'pricePrediction lowestPrice name').lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product.pricePrediction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/prices/alerts/drops  – products likely to drop soon
router.get('/alerts/drops', async (_req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      'pricePrediction.willDrop': true,
      'pricePrediction.confidence': { $gte: 0.6 },
    }).sort({ 'pricePrediction.predictedDropPercent': -1 }).limit(10).lean();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
