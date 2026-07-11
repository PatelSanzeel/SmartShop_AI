const express = require('express');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/products  – search & filter
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      q, category, minPrice, maxPrice, minRating,
      store, sort = 'relevance', page = 1, limit = 20,
    } = req.query;

    const filter = { isActive: true };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.lowestPrice = {};
      if (minPrice) filter.lowestPrice.$gte = Number(minPrice);
      if (maxPrice) filter.lowestPrice.$lte = Number(maxPrice);
    }
    if (minRating) filter.averageRating = { $gte: Number(minRating) };
    if (store) filter['stores.store'] = store;
    if (q) filter.$text = { $search: q };

    const sortMap = {
      relevance: q ? { score: { $meta: 'textScore' } } : { viewCount: -1 },
      price_asc: { lowestPrice: 1 },
      price_desc: { lowestPrice: -1 },
      rating: { averageRating: -1 },
      newest: { createdAt: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter, q ? { score: { $meta: 'textScore' } } : {})
        .sort(sortMap[sort] || sortMap.relevance)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/categories
router.get('/categories', async (_req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/trending
router.get('/trending', async (_req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ viewCount: -1, compareCount: -1 })
      .limit(8)
      .lean();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
