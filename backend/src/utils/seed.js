/**
 * Database seed script
 * Run: npm run seed --workspace=backend
 */
require('dotenv').config({ path: '../../.env.example' });
// Also try local .env
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartshopai';

const generatePriceHistory = (basePrice, days = 90) => {
  const history = [];
  const stores = ['Amazon', 'Best Buy', 'Walmart'];
  for (let i = days; i >= 0; i--) {
    const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    stores.forEach(store => {
      const variance = (Math.random() - 0.5) * 0.15 * basePrice;
      history.push({ price: Math.max(basePrice * 0.7, basePrice + variance), store, timestamp });
    });
  }
  return history;
};

const sampleReviews = (count, avgRating) => {
  const reviewTemplates = [
    { text: 'Absolutely love this product! Exceeded all my expectations.', rating: 5, sentiment: 'positive' },
    { text: 'Great quality for the price. Would definitely recommend.', rating: 4, sentiment: 'positive' },
    { text: 'Decent product, does what it says. Nothing spectacular.', rating: 3, sentiment: 'neutral' },
    { text: 'Had some issues initially but customer service resolved them.', rating: 3, sentiment: 'neutral' },
    { text: 'Not worth the price. Quality feels cheap after a month.', rating: 2, sentiment: 'negative' },
    { text: 'Stopped working after 2 weeks. Very disappointed.', rating: 1, sentiment: 'negative' },
    { text: 'Perfect! Exactly as described. Fast shipping too.', rating: 5, sentiment: 'positive' },
    { text: 'Good value, solid build quality. Happy with the purchase.', rating: 4, sentiment: 'positive' },
    { text: 'Amazing product! Best purchase I made this year!', rating: 5, sentiment: 'positive', fakeScore: 0.72 },
    { text: 'Best product ever! Highly recommend!!!', rating: 5, sentiment: 'positive', fakeScore: 0.78 },
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = reviewTemplates[i % reviewTemplates.length];
    return {
      author: `User${Math.floor(Math.random() * 9000) + 1000}`,
      ...template,
      fakeScore: template.fakeScore || Math.random() * 0.3,
      verified: Math.random() > 0.3,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      helpful: Math.floor(Math.random() * 50),
    };
  });
};

const products = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    brand: 'Sony',
    category: 'Electronics',
    subcategory: 'Headphones',
    description: 'Industry-leading noise canceling with Auto NC Optimizer. Crystal clear hands-free calling. Up to 30-hour battery life.',
    thumbnail: 'https://picsum.photos/seed/headphones1/400/300',
    images: ['https://picsum.photos/seed/headphones1/800/600'],
    specifications: new Map([['Connectivity', 'Bluetooth 5.2'], ['Battery', '30 hours'], ['Weight', '250g'], ['NFC', 'Yes'], ['Foldable', 'Yes']]),
    tags: ['headphones', 'wireless', 'noise-canceling', 'premium', 'sony'],
    stores: [
      { store: 'Amazon', price: 329.99, originalPrice: 399.99, discount: 17, inStock: true, stockCount: 45, shippingCost: 0, shippingDays: 2, rating: 4.6, reviewCount: 12450 },
      { store: 'Best Buy', price: 349.99, originalPrice: 399.99, discount: 12, inStock: true, stockCount: 12, shippingCost: 0, shippingDays: 3, rating: 4.5, reviewCount: 8300 },
      { store: 'Walmart', price: 339.99, originalPrice: 399.99, discount: 15, inStock: false, shippingCost: 5.99, shippingDays: 5, rating: 4.4, reviewCount: 4200 },
    ],
    lowestPrice: 329.99,
    highestPrice: 349.99,
    averageRating: 4.6,
    totalReviews: 185,
    pricePrediction: { willDrop: true, predictedDropPercent: 12, predictedDropDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), confidence: 0.78, trend: 'falling' },
    aiSummary: 'Premium noise-canceling headphones with industry-leading ANC technology. Best-in-class for frequent travelers and remote workers.',
    viewCount: 8420,
    compareCount: 2100,
  },
  {
    name: 'Apple MacBook Air M3 13-inch',
    brand: 'Apple',
    category: 'Electronics',
    subcategory: 'Laptops',
    description: 'Supercharged by the M3 chip. Up to 18 hours of battery. 15% faster than M2. Available in Midnight, Starlight, and Space Gray.',
    thumbnail: 'https://picsum.photos/seed/macbook1/400/300',
    images: ['https://picsum.photos/seed/macbook1/800/600'],
    specifications: new Map([['Chip', 'Apple M3'], ['RAM', '8GB unified'], ['Storage', '256GB SSD'], ['Display', '13.6" Liquid Retina'], ['Battery', '18 hours']]),
    tags: ['laptop', 'apple', 'macbook', 'm3', 'ultrabook'],
    stores: [
      { store: 'Apple Store', price: 1099.00, originalPrice: 1099.00, discount: 0, inStock: true, shippingCost: 0, shippingDays: 3, rating: 4.8, reviewCount: 6700 },
      { store: 'Amazon', price: 1049.00, originalPrice: 1099.00, discount: 5, inStock: true, stockCount: 30, shippingCost: 0, shippingDays: 1, rating: 4.7, reviewCount: 4500 },
      { store: 'Best Buy', price: 1099.00, originalPrice: 1099.00, discount: 0, inStock: true, shippingCost: 0, shippingDays: 2, rating: 4.8, reviewCount: 3200 },
    ],
    lowestPrice: 1049.00,
    highestPrice: 1099.00,
    averageRating: 4.8,
    totalReviews: 243,
    pricePrediction: { willDrop: false, predictedDropPercent: 0, confidence: 0.85, trend: 'stable' },
    aiSummary: 'Apple\'s most efficient laptop yet. Perfect for students and professionals who need all-day battery life with premium build quality.',
    viewCount: 14200,
    compareCount: 4800,
  },
  {
    name: 'Samsung 65" QLED 4K Smart TV QN90C',
    brand: 'Samsung',
    category: 'Electronics',
    subcategory: 'Televisions',
    description: 'Neo QLED 4K TV with Quantum Matrix Technology Pro. Anti-reflection screen. 144Hz for ultra-smooth gaming.',
    thumbnail: 'https://picsum.photos/seed/tv1/400/300',
    images: ['https://picsum.photos/seed/tv1/800/600'],
    specifications: new Map([['Size', '65 inch'], ['Resolution', '4K UHD'], ['HDR', 'Quantum HDR 32x'], ['Refresh Rate', '144Hz'], ['Smart OS', 'Tizen']]),
    tags: ['tv', 'samsung', 'qled', '4k', 'smart tv', 'gaming'],
    stores: [
      { store: 'Samsung', price: 1497.99, originalPrice: 1999.99, discount: 25, inStock: true, shippingCost: 0, shippingDays: 5, rating: 4.6, reviewCount: 8900 },
      { store: 'Amazon', price: 1449.00, originalPrice: 1999.99, discount: 28, inStock: true, shippingCost: 0, shippingDays: 3, rating: 4.5, reviewCount: 12100 },
      { store: 'Best Buy', price: 1499.99, originalPrice: 1999.99, discount: 25, inStock: true, shippingCost: 0, shippingDays: 4, rating: 4.6, reviewCount: 7800 },
      { store: 'Costco', price: 1399.99, originalPrice: 1999.99, discount: 30, inStock: false, shippingCost: 0, shippingDays: 7, rating: 4.7, reviewCount: 3400 },
    ],
    lowestPrice: 1399.99,
    highestPrice: 1499.99,
    averageRating: 4.6,
    totalReviews: 198,
    pricePrediction: { willDrop: true, predictedDropPercent: 18, predictedDropDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), confidence: 0.82, trend: 'falling' },
    aiSummary: 'Best-in-class QLED TV for home theaters and gamers. The 144Hz display and anti-glare tech make it a top pick this season.',
    viewCount: 11300,
    compareCount: 3600,
  },
  {
    name: 'Nike Air Max 270 React Sneakers',
    brand: 'Nike',
    category: 'Clothing',
    subcategory: 'Footwear',
    description: 'The Nike Air Max 270 React combines two of Nike\'s most innovative technologies for an ultra-comfortable ride.',
    thumbnail: 'https://picsum.photos/seed/nike1/400/300',
    images: ['https://picsum.photos/seed/nike1/800/600'],
    specifications: new Map([['Material', 'Mesh upper'], ['Sole', 'React + Air Max 270'], ['Sizes', 'US 6-15'], ['Colors', 'Multiple']]),
    tags: ['sneakers', 'nike', 'air max', 'running', 'casual'],
    stores: [
      { store: 'Nike', price: 150.00, originalPrice: 150.00, discount: 0, inStock: true, shippingCost: 0, shippingDays: 3, rating: 4.5, reviewCount: 9800 },
      { store: 'Amazon', price: 119.95, originalPrice: 150.00, discount: 20, inStock: true, shippingCost: 0, shippingDays: 2, rating: 4.4, reviewCount: 7200 },
      { store: 'Foot Locker', price: 140.00, originalPrice: 150.00, discount: 7, inStock: true, shippingCost: 5.99, shippingDays: 4, rating: 4.5, reviewCount: 4100 },
    ],
    lowestPrice: 119.95,
    highestPrice: 150.00,
    averageRating: 4.5,
    totalReviews: 167,
    pricePrediction: { willDrop: false, predictedDropPercent: 0, confidence: 0.7, trend: 'stable' },
    aiSummary: 'Highly versatile sneaker loved for everyday comfort and casual style. Best deal found on Amazon with 20% off.',
    viewCount: 6700,
    compareCount: 1900,
  },
  {
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker 6Qt',
    brand: 'Instant Pot',
    category: 'Home & Kitchen',
    subcategory: 'Appliances',
    description: '7-in-1: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. 6-quart size feeds 4–6 people.',
    thumbnail: 'https://picsum.photos/seed/instantpot/400/300',
    images: ['https://picsum.photos/seed/instantpot/800/600'],
    specifications: new Map([['Capacity', '6 Quart'], ['Functions', '7-in-1'], ['Power', '1000W'], ['Programs', '14 smart programs']]),
    tags: ['kitchen', 'pressure cooker', 'instant pot', 'cooking', 'appliance'],
    stores: [
      { store: 'Amazon', price: 69.99, originalPrice: 99.99, discount: 30, inStock: true, stockCount: 200, shippingCost: 0, shippingDays: 1, rating: 4.7, reviewCount: 145000 },
      { store: 'Walmart', price: 79.99, originalPrice: 99.99, discount: 20, inStock: true, shippingCost: 0, shippingDays: 2, rating: 4.6, reviewCount: 89000 },
      { store: "Target", price: 84.99, originalPrice: 99.99, discount: 15, inStock: true, shippingCost: 0, shippingDays: 3, rating: 4.6, reviewCount: 42000 },
    ],
    lowestPrice: 69.99,
    highestPrice: 84.99,
    averageRating: 4.7,
    totalReviews: 312,
    pricePrediction: { willDrop: true, predictedDropPercent: 8, predictedDropDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), confidence: 0.65, trend: 'falling' },
    aiSummary: 'The most popular pressure cooker on the market. Excellent value and versatility for home cooks.',
    viewCount: 18900,
    compareCount: 5200,
  },
  {
    name: 'Atomic Habits by James Clear',
    brand: 'Penguin Random House',
    category: 'Books',
    subcategory: 'Self-Help',
    description: 'The #1 New York Times bestseller. Over 15 million copies sold. Practical strategies to build good habits and break bad ones.',
    thumbnail: 'https://picsum.photos/seed/book1/400/300',
    images: ['https://picsum.photos/seed/book1/800/600'],
    specifications: new Map([['Format', 'Hardcover / Paperback / Kindle'], ['Pages', '320'], ['Language', 'English'], ['Publisher', 'Avery']]),
    tags: ['book', 'self-help', 'habits', 'productivity', 'bestseller'],
    stores: [
      { store: 'Amazon', price: 11.98, originalPrice: 27.00, discount: 56, inStock: true, shippingCost: 0, shippingDays: 1, rating: 4.8, reviewCount: 92000 },
      { store: 'Barnes & Noble', price: 18.00, originalPrice: 27.00, discount: 33, inStock: true, shippingCost: 3.99, shippingDays: 5, rating: 4.8, reviewCount: 12000 },
      { store: 'Target', price: 14.99, originalPrice: 27.00, discount: 44, inStock: true, shippingCost: 0, shippingDays: 3, rating: 4.7, reviewCount: 8700 },
    ],
    lowestPrice: 11.98,
    highestPrice: 18.00,
    averageRating: 4.8,
    totalReviews: 289,
    pricePrediction: { willDrop: false, predictedDropPercent: 0, confidence: 0.9, trend: 'stable' },
    aiSummary: 'Transformative guide to building positive habits. Best Kindle deal at $11.98 — lowest historical price.',
    viewCount: 7800,
    compareCount: 890,
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum',
    brand: 'Dyson',
    category: 'Home & Kitchen',
    subcategory: 'Vacuums',
    description: 'The most powerful, intelligent cordless vacuum. Laser reveals microscopic dust. HEPA filtration. 60-minute run time.',
    thumbnail: 'https://picsum.photos/seed/dyson1/400/300',
    images: ['https://picsum.photos/seed/dyson1/800/600'],
    specifications: new Map([['Suction', '230 AW'], ['Run time', '60 min'], ['Filtration', 'Whole-machine HEPA'], ['Weight', '3.1 kg']]),
    tags: ['vacuum', 'dyson', 'cordless', 'hepa', 'cleaning'],
    stores: [
      { store: 'Dyson', price: 749.99, originalPrice: 749.99, discount: 0, inStock: true, shippingCost: 0, shippingDays: 3, rating: 4.7, reviewCount: 15600 },
      { store: 'Amazon', price: 699.99, originalPrice: 749.99, discount: 7, inStock: true, shippingCost: 0, shippingDays: 2, rating: 4.6, reviewCount: 24000 },
      { store: 'Best Buy', price: 724.99, originalPrice: 749.99, discount: 3, inStock: true, shippingCost: 0, shippingDays: 4, rating: 4.7, reviewCount: 9800 },
    ],
    lowestPrice: 699.99,
    highestPrice: 749.99,
    averageRating: 4.7,
    totalReviews: 221,
    pricePrediction: { willDrop: true, predictedDropPercent: 15, predictedDropDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), confidence: 0.71, trend: 'falling' },
    aiSummary: 'The gold standard of cordless vacuums. Laser dust detection is a genuine innovation. Best bought on Amazon at $50 below MSRP.',
    viewCount: 9200,
    compareCount: 3100,
  },
  {
    name: 'Garmin Forerunner 265 GPS Running Watch',
    brand: 'Garmin',
    category: 'Sports',
    subcategory: 'Fitness Trackers',
    description: 'Advanced running metrics, AMOLED display, race predictor, and training readiness score. 13-day battery life.',
    thumbnail: 'https://picsum.photos/seed/garmin1/400/300',
    images: ['https://picsum.photos/seed/garmin1/800/600'],
    specifications: new Map([['Display', 'AMOLED 1.3"'], ['GPS', 'Multi-band GPS'], ['Battery', '13 days smartwatch / 20h GPS'], ['Water', '5 ATM']]),
    tags: ['watch', 'garmin', 'running', 'gps', 'fitness', 'sports'],
    stores: [
      { store: 'Garmin', price: 449.99, originalPrice: 449.99, discount: 0, inStock: true, shippingCost: 0, shippingDays: 3, rating: 4.6, reviewCount: 5400 },
      { store: 'Amazon', price: 399.99, originalPrice: 449.99, discount: 11, inStock: true, shippingCost: 0, shippingDays: 2, rating: 4.5, reviewCount: 8900 },
      { store: 'REI', price: 419.99, originalPrice: 449.99, discount: 7, inStock: true, shippingCost: 0, shippingDays: 4, rating: 4.6, reviewCount: 2100 },
    ],
    lowestPrice: 399.99,
    highestPrice: 449.99,
    averageRating: 4.6,
    totalReviews: 178,
    pricePrediction: { willDrop: false, predictedDropPercent: 0, confidence: 0.68, trend: 'stable' },
    aiSummary: 'Top choice for serious runners. The AMOLED display and training insights put it ahead of competitors at this price point.',
    viewCount: 5600,
    compareCount: 2400,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    for (const productData of products) {
      const priceHistory = generatePriceHistory(productData.lowestPrice);
      const reviews = sampleReviews(Math.floor(Math.random() * 20) + 10, productData.averageRating);
      await Product.create({ ...productData, priceHistory, reviews });
    }

    console.log(`✅ Seeded ${products.length} products with price history and reviews`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
