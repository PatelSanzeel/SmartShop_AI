const express = require('express');
const Product = require('../models/Product');
const { protect, optionalAuth } = require('../middleware/auth');
const graniteService = require('../services/granite');

const router = express.Router();

// POST /api/ai/chat  – conversational assistant
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const userPrefs = req.user?.preferences || {};
    const response = await graniteService.chat(message, context || [], userPrefs);
    res.json({ success: true, data: { response, timestamp: new Date() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/recommend  – budget-based recommendations
router.post('/recommend', optionalAuth, async (req, res) => {
  try {
    const { budget, categories, preferences, useProfile } = req.body;

    const effectiveBudget = useProfile ? req.user?.preferences?.budget : budget;
    const effectiveCategories = useProfile ? req.user?.preferences?.categories : categories;

    const filter = { isActive: true };
    if (effectiveBudget) filter.lowestPrice = { $lte: Number(effectiveBudget) };
    if (effectiveCategories?.length) filter.category = { $in: effectiveCategories };

    const candidates = await Product.find(filter)
      .sort({ averageRating: -1, viewCount: -1 })
      .limit(50)
      .lean();

    const recommendations = await graniteService.recommend(candidates, {
      budget: effectiveBudget,
      categories: effectiveCategories,
      preferences,
    });

    res.json({ success: true, data: recommendations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/analyze-reviews  – fake review detection
router.post('/analyze-reviews', async (req, res) => {
  try {
    const { productId, reviews } = req.body;
    let targetReviews = reviews;

    if (productId && !reviews) {
      const product = await Product.findById(productId).lean();
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      targetReviews = product.reviews;
    }

    if (!targetReviews?.length) {
      return res.status(400).json({ success: false, message: 'No reviews to analyze' });
    }

    const analysis = await graniteService.detectFakeReviews(targetReviews);
    res.json({ success: true, data: analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/price-prediction
router.post('/price-prediction', async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const prediction = await graniteService.predictPriceDrop(product);

    await Product.findByIdAndUpdate(productId, { $set: { pricePrediction: prediction } });

    res.json({ success: true, data: prediction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/shopping-insights
router.post('/shopping-insights', protect, async (req, res) => {
  try {
    const { recentSearches, savedProducts } = req.body;
    const user = req.user;

    const savedProductDocs = savedProducts?.length
      ? await Product.find({ _id: { $in: savedProducts } }).lean()
      : [];

    const insights = await graniteService.generateInsights(user, savedProductDocs, recentSearches || []);
    res.json({ success: true, data: insights });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
