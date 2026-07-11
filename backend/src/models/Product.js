const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  verified: { type: Boolean, default: false },
  fakeScore: { type: Number, default: 0, min: 0, max: 1 },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
  helpful: { type: Number, default: 0 },
});

const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  store: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const storeListingSchema = new mongoose.Schema({
  store: { type: String, required: true },
  storeLogo: { type: String, default: '' },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: Number, default: 0 },
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number },
  shippingCost: { type: Number, default: 0 },
  shippingDays: { type: Number, default: 3 },
  url: { type: String, default: '' },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviewCount: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: 'text' },
  brand: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Toys', 'Automotive', 'Other'],
  },
  subcategory: { type: String, default: '' },
  description: { type: String, default: '' },
  images: [{ type: String }],
  thumbnail: { type: String, default: '' },
  specifications: { type: Map, of: String },
  tags: [{ type: String }],
  averageRating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  stores: [storeListingSchema],
  lowestPrice: { type: Number, default: 0 },
  highestPrice: { type: Number, default: 0 },
  priceHistory: [priceHistorySchema],
  pricePrediction: {
    willDrop: { type: Boolean, default: false },
    predictedDropPercent: { type: Number, default: 0 },
    predictedDropDate: { type: Date },
    confidence: { type: Number, default: 0, min: 0, max: 1 },
    trend: { type: String, enum: ['rising', 'falling', 'stable'], default: 'stable' },
  },
  aiSummary: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  compareCount: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, lowestPrice: 1 });
productSchema.index({ 'stores.store': 1 });

module.exports = mongoose.model('Product', productSchema);
