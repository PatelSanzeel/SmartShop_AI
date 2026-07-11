const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const graniteService = require('../services/granite');

const router = express.Router();

// GET /api/reviews/:productId
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const reviews = product.reviews.map(r => ({
      ...r,
      isFake: r.fakeScore > 0.6,
      fakeSeverity: r.fakeScore > 0.8 ? 'high' : r.fakeScore > 0.6 ? 'medium' : 'low',
    }));

    const summary = {
      total: reviews.length,
      average: product.averageRating,
      distribution: [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => Math.round(r.rating) === star).length,
      })),
      fakeCount: reviews.filter(r => r.isFake).length,
      fakePercent: reviews.length
        ? Math.round((reviews.filter(r => r.isFake).length / reviews.length) * 100)
        : 0,
      sentimentBreakdown: {
        positive: reviews.filter(r => r.sentiment === 'positive').length,
        neutral: reviews.filter(r => r.sentiment === 'neutral').length,
        negative: reviews.filter(r => r.sentiment === 'negative').length,
      },
    };

    res.json({ success: true, data: { reviews, summary } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/reviews/:productId  – add a review
router.post('/:productId', protect, async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating || !text) {
      return res.status(400).json({ success: false, message: 'Rating and text are required' });
    }

    const fakeAnalysis = await graniteService.detectFakeReviews([{ author: req.user.name, rating, text }]);
    const fakeScore = fakeAnalysis.reviews?.[0]?.fakeScore || 0;
    const sentiment = fakeAnalysis.reviews?.[0]?.sentiment || 'neutral';

    const review = {
      author: req.user.name,
      rating: Number(rating),
      text,
      verified: true,
      fakeScore,
      sentiment,
    };

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      { $push: { reviews: review }, $inc: { totalReviews: 1 } },
      { new: true }
    );

    // Recalculate average rating
    const avg = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    await Product.findByIdAndUpdate(req.params.productId, { averageRating: avg.toFixed(1) });

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
