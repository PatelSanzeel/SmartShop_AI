import React, { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Bot, User, Sparkles, Zap, RotateCcw } from 'lucide-react';
import { aiAPI } from '../api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

const QUICK_PROMPTS = [
  { label: '🎯 Find best laptop under $800', text: 'Find me the best laptop under $800 with good battery life' },
  { label: '🔍 Detect fake reviews', text: 'How do you detect fake reviews? What signals do you look for?' },
  { label: '📉 Price drop tips', text: 'What are the best strategies to buy products when prices drop?' },
  { label: '🛒 Compare headphones', text: 'Compare Sony WH-1000XM5 vs alternatives for commuters' },
  { label: '💡 Budget shopping tips', text: 'Give me 5 smart shopping tips to save money online' },
  { label: '📦 Best deal right now', text: 'What are the best product deals available right now?' },
];

const initialMessages = [
  {
    id: 1, role: 'assistant',
    content: `# Welcome to SmartShop AI Assistant! 🛍️

I'm your intelligent shopping companion, powered by **IBM Granite AI**. Here's what I can do:

• **🔍 Product Discovery** — Find best products for your budget & needs
• **📊 Price Analysis** — Track trends and predict price drops
• **🛡️ Review Authenticity** — Identify fake and incentivized reviews  
• **🎯 Personalized Tips** — Tailored recommendations based on your preferences
• **🔄 Store Comparison** — Compare prices across Amazon, Walmart, Best Buy & more

What can I help you with today?`,
    timestamp: new Date(),
  },
];

export default function Assistant() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text = input) => {
    if (!text?.trim() || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: text.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg, { id: 'typing', role: 'assistant', content: '', isTyping: true }]);
    setInput('');
    setIsLoading(true);

    const context = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));

    try {
      const { data } = await aiAPI.chat(text, context);
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        { id: Date.now() + 1, role: 'assistant', content: data.data.response, timestamp: new Date() },
      ]);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      toast.error('AI service unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages(initialMessages);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl ai-gradient flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            AI Shopping Assistant
          </h1>
          <p className="section-subtitle flex items-center gap-1 mt-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            IBM Granite granite-13b-chat-v2 · Online
          </p>
        </div>
        <button onClick={clearChat} className="btn-ghost text-sm">
          <RotateCcw size={14} /> New Chat
        </button>
      </div>

      {/* Quick prompts */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_PROMPTS.map(({ label, text }) => (
            <button
              key={label}
              onClick={() => sendMessage(text)}
              disabled={isLoading}
              className="text-left px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all disabled:opacity-50"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="card overflow-hidden flex flex-col" style={{ height: '520px' }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-9 h-9 rounded-full ai-gradient flex-shrink-0 flex items-center justify-center mt-0.5 shadow-sm">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={msg.role === 'user' ? 'chat-bubble-user text-sm' : 'chat-bubble-ai text-sm'}
              >
                {msg.isTyping ? (
                  <div className="flex items-center gap-1.5 px-1 py-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className={`w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce animation-delay-${i}00`} />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">IBM Granite is thinking...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                )}
              </motion.div>

              {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about products, prices, reviews, recommendations..."
              className="flex-1 input-field"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-11 h-11 rounded-xl ai-gradient flex items-center justify-center text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            >
              {isLoading ? <div className="spinner w-4 h-4 border-white border-t-transparent" /> : <Send size={17} />}
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Powered by <strong>IBM Granite AI</strong> · Responses are AI-generated
          </p>
        </div>
      </div>
    </div>
  );
}
