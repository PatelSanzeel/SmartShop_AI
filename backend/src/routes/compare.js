const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');
const { CompareSession } = require('../models/Compare');
const { optionalAuth } = require('../middleware/auth');
const graniteService = require('../services/granite');

const router = express.Router();

// POST /api/compare
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { productIds, criteria } = req.body;
    if (!Array.isArray(productIds) || productIds.length < 2) {
      return res.status(400).json({ success: false, message: 'Provide at least 2 product IDs' });
    }
    if (productIds.length > 5) {
      return res.status(400).json({ success: false, message: 'Cannot compare more than 5 products at once' });
    }

    const products = await Product.find({ _id: { $in: productIds }, isActive: true }).lean();
    if (products.length < 2) {
      return res.status(404).json({ success: false, message: 'Not enough products found' });
    }

    // Increment compare counts
    await Product.updateMany({ _id: { $in: productIds } }, { $inc: { compareCount: 1 } });

    // Build a structured comparison table
    const comparisonTable = products.map(p => ({
      id: p._id,
      name: p.name,
      brand: p.brand,
      lowestPrice: p.lowestPrice,
      highestPrice: p.highestPrice,
      averageRating: p.averageRating,
      totalReviews: p.totalReviews,
      stores: p.stores.length,
      inStock: p.stores.some(s => s.inStock),
      pricePrediction: p.pricePrediction,
    }));

    // Get AI analysis
    const aiAnalysis = await graniteService.compareProducts(products, criteria || []);

    // Determine winner by composite score
    const scored = products.map(p => ({
      id: p._id,
      score: (p.averageRating * 20) + (100 - (p.lowestPrice / Math.max(...products.map(x => x.lowestPrice))) * 100),
    })).sort((a, b) => b.score - a.score);

    const sessionId = uuidv4();
    const session = await CompareSession.create({
      user: req.user?._id,
      sessionId,
      products: productIds,
      aiAnalysis,
      winner: scored[0].id,
      criteria: criteria || [],
    });

    res.json({
      success: true,
      data: { sessionId, comparisonTable, products, aiAnalysis, winner: scored[0].id, sessionDbId: session._id },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/compare/:sessionId
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await CompareSession.findOne({ sessionId: req.params.sessionId })
      .populate('products')
      .lean();
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
