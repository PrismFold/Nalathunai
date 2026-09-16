import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiChatService } from '../services/aiChatService';
import {
  X,
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const PatientChatbot = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesRef = useRef([]);
  const handleSendMessageRef = useRef(null);

  // Keep messagesRef synchronized
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const handleSendMessage = useCallback(async (queryText) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isThinking) return;

    setInputQuery('');
    setIsThinking(true);

    const currentHistory = messagesRef.current;
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: query,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const result = await aiChatService.sendMessage({
        query,
        patient: user,
        history: currentHistory,
      });

      setMessages(result.history);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'I apologize, but I encountered a brief connection error. Your records remain safe. Please try your question again.',
          suggestions: ['Summarize my overall health status', 'What does my HbA1c & Glucose mean?'],
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  }, [inputQuery, isThinking, user]);

  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // Initialize conversation once per user
  useEffect(() => {
    const history = aiChatService.getStoredMessages(user?.name || 'there');
    setMessages(history);
  }, [user?.name]);

  // Listen to external open trigger
  useEffect(() => {
    const handleOpenTrigger = (e) => {
      setIsOpen(true);
      if (e?.detail?.query) {
        handleSendMessageRef.current?.(e.detail.query);
      }
    };

    window.addEventListener('open_nalathunai_chatbot', handleOpenTrigger);
    return () => {
      window.removeEventListener('open_nalathunai_chatbot', handleOpenTrigger);
    };
  }, []);

  const handleResetChat = () => {
    const reset = aiChatService.clearHistory(user?.name || 'there');
    setMessages(reset);
  };

  const handleActionClick = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // Render markdown-like bullet points and bold text
  const formatMessageText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');

    return (
      <div className="space-y-1.5 leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;

          // Bullet points
          if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            const content = line.trim().replace(/^[•-]\s*/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-[#0f5257] font-bold text-xs mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: renderBold(content) }} />
              </div>
            );
          }

          // Numbered items
          if (/^\d+\.\s/.test(line.trim())) {
            return (
              <div key={idx} className="pl-1">
                <span dangerouslySetInnerHTML={{ __html: renderBold(line) }} />
              </div>
            );
          }

          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: renderBold(line) }} />
          );
        })}
      </div>
    );
  };

  const renderBold = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-stone-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-stone-700">$1</em>');
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON (Always visible at bottom-right) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {hasUnread && (
            <div className="hidden sm:flex items-center gap-2 py-2 px-3.5 bg-white border border-[#0f5257]/30 text-[#0f5257] text-xs font-semibold rounded-full shadow-lg animate-bounce">
              <Sparkles size={13} className="text-[#0f5257]" />
              <span>Ask AI Medical Assistant</span>
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0f5257] to-[#1e3a5f] text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group border-2 border-white/60 relative"
          >
            <Bot size={26} className="group-hover:rotate-6 transition-transform" />
            
            {/* Online Pulse Badge */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            </span>
          </button>
        </div>
      )}

      {/* CHAT WINDOW MODAL / POPUP */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-50 bg-white border border-stone-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 font-sans ${
            isExpanded
              ? 'w-[95vw] sm:w-[540px] h-[85vh] max-h-[750px]'
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#0f5257] to-[#1e3a5f] p-4 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-xs flex items-center justify-center text-white border border-white/20">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold tracking-tight">Nalathunai AI Assistant</h3>
                  <span className="px-1.5 py-0.2 bg-emerald-400/20 text-emerald-300 text-[10px] font-medium rounded-full flex items-center gap-1 border border-emerald-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-white/75 font-light">
                  Clinical Summaries &amp; Platform Guide
                </p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <RotateCcw size={14} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize size' : 'Expand size'}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* PATIENT CONTEXT STRIP */}
          <div className="bg-[#f7f6f2] px-4 py-2 border-b border-stone-200 text-[11px] text-stone-600 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Activity size={12} className="text-[#0f5257] shrink-0" />
              <span className="truncate">
                Patient: <strong>{user?.name || 'Jeremiah'}</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono text-stone-400 shrink-0">ABDM Synced</span>
          </div>

          {/* MESSAGES AREA */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50 text-xs">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-xs ${
                      isUser
                        ? 'bg-[#0f5257] text-white rounded-br-xs'
                        : 'bg-white border border-stone-200 text-stone-800 rounded-bl-xs'
                    }`}
                  >
                    {/* Message Body */}
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      formatMessageText(msg.text)
                    )}

                    {/* Action Link Button if provided */}
                    {msg.actionLink && !isUser && (
                      <div className="mt-3 pt-2.5 border-t border-stone-100">
                        <button
                          onClick={() => handleActionClick(msg.actionLink.path)}
                          className="w-full py-1.5 px-3 bg-[#e8f3f3] hover:bg-[#d8ecec] text-[#0f5257] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>{msg.actionLink.text}</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] text-stone-400 mt-1 px-1 font-mono">
                    {msg.timestamp}
                  </span>

                  {/* Suggestions Chips on Latest Assistant Message */}
                  {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                      {msg.suggestions.map((sug, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleSendMessage(sug)}
                          disabled={isThinking}
                          className="text-[11px] text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 hover:border-[#0f5257]/40 py-1 px-2.5 rounded-full text-left transition-all active:scale-95 shadow-2xs"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Typing Animation */}
            {isThinking && (
              <div className="flex items-center gap-2 text-stone-400 text-xs py-1">
                <div className="w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[#0f5257]">
                  <Sparkles size={12} className="animate-spin" />
                </div>
                <div className="bg-white border border-stone-200 px-3 py-2 rounded-2xl flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#0f5257] rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-[#0f5257] rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-[#0f5257] rounded-full animate-bounce" />
                  <span className="text-[11px] text-stone-500 ml-1">Analyzing records…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM & DISCLAIMER */}
          <div className="p-3 bg-white border-t border-stone-200 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about your vitals, reports, or consent…"
                disabled={isThinking}
                className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f5257]/30 focus:border-[#0f5257] transition-all"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isThinking}
                className="p-2.5 bg-[#0f5257] hover:bg-[#0c4246] disabled:opacity-40 text-white rounded-xl transition-all shadow-xs shrink-0 flex items-center justify-center"
              >
                <Send size={15} />
              </button>
            </form>

            <p className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck size={11} className="text-[#0f5257] shrink-0" />
              Nalathunai AI is an educational guide. Consult your doctor for medical diagnosis.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
