import React, { useState, useRef, useEffect } from 'react';
import { Send, User, FileText, Volume2, Square } from 'lucide-react';
import type { Message } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatAreaProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setTotalTokens: React.Dispatch<React.SetStateAction<number>>;
  language: string;
  apiKey: string | null;
  aiProvider: string | null;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, setMessages, setTotalTokens, language, apiKey, aiProvider }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  
  const speakText = (text: string, msgId: string) => {
    if (isPlaying === msgId) {
      window.speechSynthesis.cancel();
      setIsPlaying(null);
      return;
    }
    
    window.speechSynthesis.cancel(); // Stop any current speech
    
    // Remove citations and markdown from spoken text
    const cleanText = text.replace(/\[\d+\]/g, '').replace(/[\*\_\#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to set a Hindi voice if requested language is Hindi/Hinglish
    if (language !== 'English') {
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
    }

    utterance.onend = () => setIsPlaying(null);
    utterance.onerror = () => setIsPlaying(null);
    
    setIsPlaying(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages.map(msg => ({ role: msg.role, content: msg.content }));
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
        if (aiProvider) headers['X-AI-Provider'] = aiProvider;
      }
      
      const response = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ message: userMsg.content, history: history, language: language }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("TRIAL_LIMIT");
        }
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      if (data.tokens_used) {
        setTotalTokens(prev => prev + data.tokens_used);
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources
      }]);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message === "TRIAL_LIMIT" 
        ? "You have reached your 5,000 token free trial limit. Please click the ⚙️ Setup button in the sidebar to enter your own API key and continue using the Workspace."
        : "Sorry, I'm having trouble connecting to my brain right now. Is the backend running?";
        
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorMsg
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="flex-1 min-h-0 flex flex-col relative bg-bg-main">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 md:py-7 space-y-5 md:space-y-6 z-10 scroll-smooth">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up-fade`}
          >
            <div className={`flex max-w-[92%] md:max-w-[78%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden ${
                msg.role === 'assistant' ? 'bg-accent-soft border border-border' : 'bg-accent-soft border border-border text-accent'
              }`}>
                {msg.role === 'user' ? (
                  <User size={19} />
                ) : (
                  <img src="/chatbot.png" alt="Bot" className="w-full h-full object-cover" />
                )}
              </div>

              <div className={`px-5 py-4 rounded-2xl leading-relaxed shadow-[0_8px_24px_rgba(56,48,37,0.06)] ${
                msg.role === 'user' 
                  ? 'bg-accent text-accent-text rounded-tr-md' 
                  : 'bg-bg-panel text-text-main border border-border rounded-tl-md prose prose-stone max-w-none prose-p:my-2 prose-headings:text-text-main prose-a:text-accent'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                ) : (
                  <div className="space-y-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => speakText(msg.content, msg.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-main hover:bg-accent-soft text-xs font-medium text-text-main transition-colors border border-border shadow-sm mr-2"
                        >
                          {isPlaying === msg.id ? (
                            <><Square size={12} className="text-red-500" /> Stop Audio</>
                          ) : (
                            <><Volume2 size={12} className="text-accent" /> Read Aloud</>
                          )}
                        </button>
                        
                        {msg.sources.map((source: any, idx) => {
                          const isObj = typeof source === 'object' && source !== null;
                          const name = isObj ? source.name : source;
                          const text = isObj ? source.text : null;
                          
                          return (
                            <div key={idx} className="relative group/source">
                              <span className="text-xs font-medium px-2 py-1 bg-bg-main text-text-muted border border-border rounded-md flex items-center gap-1 cursor-default hover:bg-accent-soft transition-colors">
                                <FileText size={12} /> {name}
                              </span>
                              
                              {text && (
                                <div className="absolute bottom-full left-0 mb-2 w-80 max-h-56 overflow-y-auto bg-bg-panel border border-border shadow-2xl rounded-lg p-4 opacity-0 invisible group-hover/source:opacity-100 group-hover/source:visible transition-all duration-200 z-50">
                                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Original Document Text</p>
                                  <p className="text-xs text-text-main leading-relaxed font-sans whitespace-pre-wrap">{text}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-300 z-10">
            <div className="flex max-w-[80%] gap-4 flex-row">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-accent-soft border border-border flex items-center justify-center overflow-hidden mt-1">
                <img src="/chatbot.png" alt="Bot typing" className="w-full h-full object-cover" />
              </div>
              <div className="px-5 py-4 rounded-2xl rounded-tl-md bg-bg-panel border border-border flex items-center gap-1.5 shadow-[0_8px_24px_rgba(56,48,37,0.06)]">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-6 py-4 md:py-5 bg-bg-main/90 backdrop-blur-xl border-t border-border z-10">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
          <div className="relative flex items-center bg-bg-panel border border-border rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-accent-soft focus-within:border-accent transition-all shadow-[0_8px_26px_rgba(56,48,37,0.07)]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your documents..."
              className="min-w-0 flex-1 bg-transparent px-4 md:px-5 py-4 text-text-main font-medium placeholder-text-muted focus:outline-none"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="mx-2 p-3 bg-accent hover:bg-accent-hover disabled:bg-border disabled:text-text-muted text-accent-text rounded-xl transition-colors flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
        <p className="text-center text-xs font-medium text-text-muted mt-3">
          AI can make mistakes. Verify important information with the original document.
        </p>
      </div>
    </main>
  );
};

export default ChatArea;
