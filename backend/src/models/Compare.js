const mongoose = require('mongoose');

const compareSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionId: { type: String, required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  aiAnalysis: { type: String, default: '' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  criteria: [{ type: String }],
}, { timestamps: true });

const insightSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['price_alert', 'recommendation', 'trend', 'savings_tip'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  isRead: { type: Boolean, default: false },
  metadata: { type: Map, of: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = {
  CompareSession: mongoose.model('CompareSession', compareSessionSchema),
  Insight: mongoose.model('Insight', insightSchema),
};
