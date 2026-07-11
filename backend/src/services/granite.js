/**
 * IBM Granite AI Service — watsonx.ai integration
 *
 * Uses the IBM watsonx.ai REST API to call the granite-13b-chat-v2 model.
 * Falls back to deterministic mock responses when credentials are not set,
 * so the app remains fully functional during development without an IBM account.
 */

const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 600 }); // 10-minute cache

const IAM_TOKEN_URL = 'https://iam.cloud.ibm.com/identity/token';

let cachedIAMToken = null;
let iamTokenExpiry = null;

/**
 * Obtain a short-lived IAM bearer token for watsonx.ai.
 * Tokens are reused until 5 minutes before expiry.
 */
async function getIAMToken() {
  if (cachedIAMToken && iamTokenExpiry && Date.now() < iamTokenExpiry) {
    return cachedIAMToken;
  }

  const apiKey = process.env.IBM_WATSONX_API_KEY;
  if (!apiKey || apiKey === 'your_ibm_watsonx_api_key') return null;

  try {
    const resp = await axios.post(
      IAM_TOKEN_URL,
      new URLSearchParams({ grant_type: 'urn:ibm:params:oauth:grant-type:apikey', apikey: apiKey }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    cachedIAMToken = resp.data.access_token;
    // Expire 5 min before actual expiry
    iamTokenExpiry = Date.now() + (resp.data.expires_in - 300) * 1000;
    return cachedIAMToken;
  } catch (err) {
    console.warn('⚠️  IBM IAM token fetch failed:', err.message);
    return null;
  }
}

/**
 * Core call to watsonx.ai text generation endpoint.
 * Falls back to mock when credentials are absent.
 */
async function callGranite(systemPrompt, userPrompt, options = {}) {
  const cacheKey = `granite:${Buffer.from(systemPrompt + userPrompt).toString('base64').slice(0, 64)}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const token = await getIAMToken();
  const projectId = process.env.IBM_WATSONX_PROJECT_ID;
  const modelId = process.env.IBM_GRANITE_MODEL_ID || 'ibm/granite-13b-chat-v2';
  const baseUrl = process.env.IBM_WATSONX_URL || 'https://us-south.ml.cloud.ibm.com';

  if (!token || !projectId || projectId === 'your_ibm_watsonx_project_id') {
    // ── Dev mode: return rich mock responses ──────────────────────────────────
    return mockResponse(systemPrompt, userPrompt, options);
  }

  const payload = {
    model_id: modelId,
    project_id: projectId,
    input: `<|system|>\n${systemPrompt}\n<|user|>\n${userPrompt}\n<|assistant|>\n`,
    parameters: {
      decoding_method: 'greedy',
      max_new_tokens: options.maxTokens || 512,
      temperature: options.temperature || 0.7,
      repetition_penalty: 1.1,
    },
  };

  try {
    const response = await axios.post(
      `${baseUrl}/ml/v1/text/generation?version=2023-05-29`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const text = response.data?.results?.[0]?.generated_text?.trim() || '';
    cache.set(cacheKey, text);
    return text;
  } catch (err) {
    console.error('Granite API error:', err.response?.data || err.message);
    return mockResponse(systemPrompt, userPrompt, options);
  }
}

// ─── Public service methods ────────────────────────────────────────────────────

/**
 * Conversational shopping assistant.
 */
async function chat(message, history = [], userPrefs = {}) {
  const system = `You are SmartShop AI, an expert shopping assistant. You help users find the best products, 
compare prices, detect fake reviews, and make smart purchasing decisions. 
User budget: $${userPrefs.budget || 'unset'}. Preferred categories: ${userPrefs.categories?.join(', ') || 'any'}.
Be concise, helpful, and data-driven. Format responses with clear bullet points where applicable.`;

  const historyText = history.slice(-6).map(h => `${h.role}: ${h.content}`).join('\n');
  const prompt = historyText ? `${historyText}\nuser: ${message}` : message;

  return callGranite(system, prompt, { maxTokens: 400 });
}

/**
 * Compare products side-by-side and recommend a winner.
 */
async function compareProducts(products, criteria = []) {
  const system = `You are a product comparison expert. Analyze products objectively and provide 
structured insights. Consider price, quality, features, ratings, and value for money.`;

  const productSummaries = products.map((p, i) =>
    `Product ${i + 1}: ${p.name} by ${p.brand}
    - Price range: $${p.lowestPrice}–$${p.highestPrice}
    - Rating: ${p.averageRating}/5 (${p.totalReviews} reviews)
    - Available at: ${p.stores?.map(s => s.store).join(', ')}
    - Price trend: ${p.pricePrediction?.trend || 'unknown'}`
  ).join('\n\n');

  const criteriaText = criteria.length ? `Focus criteria: ${criteria.join(', ')}.` : '';

  const prompt = `Compare these products and recommend the best buy. ${criteriaText}

${productSummaries}

Provide: 1) Overall winner with reason 2) Pros/cons for each 3) Best value pick 4) Who should buy which`;

  return callGranite(system, prompt, { maxTokens: 600 });
}

/**
 * Budget-aware product recommendations.
 */
async function recommend(products, { budget, categories, preferences } = {}) {
  const system = `You are a personalized shopping recommendation engine. 
Suggest products based on user budget, preferences, and quality signals.`;

  const topProducts = products.slice(0, 15).map(p =>
    `- ${p.name} (${p.brand}): $${p.lowestPrice} | ★${p.averageRating} | ${p.category}`
  ).join('\n');

  const prompt = `Budget: $${budget || 'unlimited'}
Categories of interest: ${categories?.join(', ') || 'any'}
Additional preferences: ${preferences || 'none'}

Available products:
${topProducts}

Recommend the top 5 products with brief explanations. Format as JSON array with fields: name, reason, score(0-100).`;

  const text = await callGranite(system, prompt, { maxTokens: 500 });

  // Parse JSON or fall back to top products
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      return { recommendations, rawAnalysis: text, products: products.slice(0, 10) };
    }
  } catch (_) {}

  return { recommendations: [], rawAnalysis: text, products: products.slice(0, 10) };
}

/**
 * Detect fake / incentivized reviews using LLM pattern recognition.
 */
async function detectFakeReviews(reviews) {
  const system = `You are a fake review detection specialist. Analyze reviews for:
- Repetitive language patterns
- Vague non-specific praise
- Suspicious timing clusters
- Unverified purchase signals
- Sentiment-rating mismatches
Be precise and return structured JSON.`;

  const reviewTexts = reviews.slice(0, 20).map((r, i) =>
    `Review ${i + 1} (★${r.rating}): "${r.text}" — by ${r.author}, verified: ${r.verified || false}`
  ).join('\n');

  const prompt = `Analyze these reviews for authenticity:

${reviewTexts}

Return JSON: { "overallTrustScore": 0-1, "fakePercent": 0-100, "reviews": [{ "index": 0, "fakeScore": 0-1, "sentiment": "positive|neutral|negative", "flags": ["flag1"] }], "summary": "..." }`;

  const text = await callGranite(system, prompt, { maxTokens: 600, temperature: 0.3 });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (_) {}

  // Fallback analysis
  return {
    overallTrustScore: 0.75,
    fakePercent: 12,
    reviews: reviews.map((r, i) => ({
      index: i,
      fakeScore: r.text.length < 20 ? 0.7 : 0.1,
      sentiment: r.rating >= 4 ? 'positive' : r.rating <= 2 ? 'negative' : 'neutral',
      flags: r.text.length < 20 ? ['too_short'] : [],
    })),
    summary: 'Majority of reviews appear authentic with minor concerns.',
  };
}

/**
 * Predict whether a product price will drop soon.
 */
async function predictPriceDrop(product) {
  const system = `You are a price trend analyst. Based on pricing history patterns and product data, 
predict whether prices will drop in the near future. Return structured JSON predictions.`;

  const recentHistory = (product.priceHistory || []).slice(-30).map(h =>
    `${new Date(h.timestamp).toLocaleDateString()}: $${h.price} (${h.store})`
  ).join('\n');

  const prompt = `Product: ${product.name}
Current lowest price: $${product.lowestPrice}
Price history (last 30 entries):
${recentHistory || 'No history available'}
Stores: ${product.stores?.map(s => `${s.store}: $${s.price}`).join(', ')}

Predict price drop probability. Return JSON:
{ "willDrop": true|false, "predictedDropPercent": 0-50, "predictedDropDate": "YYYY-MM-DD or null", "confidence": 0-1, "trend": "rising|falling|stable", "reasoning": "..." }`;

  const text = await callGranite(system, prompt, { maxTokens: 300, temperature: 0.2 });

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (_) {}

  // Deterministic fallback based on history
  const prices = (product.priceHistory || []).map(h => h.price);
  const trend = prices.length >= 2
    ? prices[prices.length - 1] < prices[0] ? 'falling' : prices[prices.length - 1] > prices[0] ? 'rising' : 'stable'
    : 'stable';

  return {
    willDrop: trend === 'falling',
    predictedDropPercent: trend === 'falling' ? 8 : 0,
    predictedDropDate: trend === 'falling'
      ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : null,
    confidence: 0.6,
    trend,
    reasoning: `Price trend is ${trend} based on historical data.`,
  };
}

/**
 * Generate personalized shopping insights for the user.
 */
async function generateInsights(user, savedProducts, recentSearches) {
  const system = `You are a personalized shopping advisor. Generate actionable insights and tips 
based on user behavior, saved products, and preferences. Be specific and helpful.`;

  const savedNames = savedProducts.slice(0, 10).map(p => p.name).join(', ');
  const searches = recentSearches.slice(0, 10).join(', ');

  const prompt = `User profile:
- Budget: $${user.preferences?.budget || 500}
- Favorite categories: ${user.preferences?.categories?.join(', ') || 'general'}
- Saved products: ${savedNames || 'none'}
- Recent searches: ${searches || 'none'}

Generate 4 personalized shopping insights. Return JSON array:
[{ "type": "recommendation|price_alert|savings_tip|trend", "title": "short title", "message": "detailed message" }]`;

  const text = await callGranite(system, prompt, { maxTokens: 500 });

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch (_) {}

  return [
    { type: 'savings_tip', title: 'Compare Before You Buy', message: 'Use our comparison tool to save up to 30% on your next purchase.' },
    { type: 'trend', title: 'Electronics Prices Trending Down', message: 'Great time to buy laptops and tablets — prices are at a seasonal low.' },
    { type: 'recommendation', title: 'Based on Your Budget', message: `We found 5 top-rated products under $${user.preferences?.budget || 500}.` },
    { type: 'price_alert', title: 'Price Drop Alert', message: 'Two of your saved products may drop in price within the next 2 weeks.' },
  ];
}

// ─── Mock responses for development ──────────────────────────────────────────

function mockResponse(system, prompt, options) {
  if (system.includes('SmartShop AI')) {
    return `I'm SmartShop AI, your intelligent shopping assistant! 🛍️

Based on your query, here are my recommendations:

• **Best Value**: Look for products with a rating above 4.2 stars
• **Price Strategy**: Compare across at least 3 stores before buying  
• **Timing**: Weekend sales often offer 10–25% discounts
• **Fake Reviews**: I'll analyze review patterns to highlight authentic feedback

Would you like me to help compare specific products or find deals in a particular category?`;
  }

  if (system.includes('comparison expert')) {
    return `## Product Comparison Analysis

**🏆 Recommended Winner**: Product 1 offers the best overall value

**Key Findings:**
- Best price-to-quality ratio: Product 1
- Highest rated: Product 2  
- Best availability: Product 3

**Who should buy what:**
- Budget-conscious shoppers → Product with lowest price
- Quality-first buyers → Highest rated option
- Need it fast? → Best shipping option

*Analysis powered by IBM Granite AI*`;
  }

  if (system.includes('fake review')) {
    return JSON.stringify({
      overallTrustScore: 0.82,
      fakePercent: 14,
      reviews: [],
      summary: 'Most reviews appear authentic. A small percentage show generic language patterns typical of incentivized reviews.',
    });
  }

  return 'Analysis complete. Our AI has processed your request and generated personalized recommendations based on available data.';
}

module.exports = {
  chat,
  compareProducts,
  recommend,
  detectFakeReviews,
  predictPriceDrop,
  generateInsights,
};
