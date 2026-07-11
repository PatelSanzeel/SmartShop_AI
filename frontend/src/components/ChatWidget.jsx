import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { useUIStore, useAuthStore } from '../store';
import { aiAPI } from '../api';
import toast from 'react-hot-toast';

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content: `👋 Hi! I'm SmartShop AI, powered by **IBM Granite**. I can help you:
    
• 🔍 Find the best products for your budget
• 📊 Compare items across stores  
• 🔎 Detect fake reviews
• 📉 Predict price drops
• 💡 Give personalized shopping tips

What are you looking for today?`,
    timestamp: new Date(),
  },
];

export default function ChatWidget() {
  const { chatOpen, setChatOpen } = useUIStore();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus();
  }, [chatOpen]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: input.trim(), timestamp: new Date() };
    const typingMsg = { id: 'typing', role: 'assistant', content: '...', isTyping: true };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setInput('');
    setIsLoading(true);

    const context = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));

    try {
      const { data } = await aiAPI.chat(input, context);
      setMessages(prev => [
        ...prev.filter(m => m.id !== 'typing'),
        { id: Date.now() + 1, role: 'assistant', content: data.data.response, timestamp: new Date() },
      ]);
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      toast.error('AI service temporarily unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Best laptop under $1000',
    'Detect fake reviews',
    'Price drop predictions',
    'Compare headphones',
  ];

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-20 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300
          ${chatOpen ? 'ai-gradient scale-90' : 'ai-gradient hover:scale-110'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="AI Shopping Assistant"
      >
        <AnimatePresence mode="wait">
          {chatOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={22} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {!chatOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse-slow" />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-36 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            style={{ height: '520px' }}
          >
            {/* Header */}
            <div className="ai-gradient px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">SmartShop AI</p>
                  <p className="text-blue-100 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    IBM Granite · Online
                  </p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full ai-gradient flex-shrink-0 flex items-center justify-center mt-0.5">
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
                    {msg.isTyping ? (
                      <div className="flex items-center gap-1 py-1">
                        {[0, 1, 2].map(i => (
                          <span key={i} className={`w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-${i}00`} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center mt-0.5 text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 2 && (
              <div className="px-4 pt-2 flex flex-wrap gap-1.5">
                {quickPrompts.map(p => (
                  <button
                    key={p}
                    onClick={() => { setInput(p); inputRef.current?.focus(); }}
                    className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={sendMessage} className="px-4 py-3 border-t border-gray-200 bg-white flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about products, prices, reviews..."
                className="flex-1 input-field py-2 text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl ai-gradient flex items-center justify-center text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
              >
                <Send size={15} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
