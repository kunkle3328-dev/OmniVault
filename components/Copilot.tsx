import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Note } from '../types';
import { Send, Sparkles, Brain, Library, BookOpen, ChevronRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { chatWithVaultStream } from '../services/geminiService';

interface Props {
  notes: Note[];
  chatHistory: ChatMessage[];
  onSetHistory: (history: ChatMessage[]) => void;
  onAddNote: (note: Partial<Note>) => void;
}

const Copilot: React.FC<Props> = ({ notes, chatHistory, onSetHistory, onAddNote }) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    const newHistory = [...chatHistory, userMsg];
    onSetHistory(newHistory);
    setInput('');
    setIsTyping(true);

    const aiMsgId = (Date.now() + 1).toString();
    let currentAiText = '';

    try {
      const stream = chatWithVaultStream(input, chatHistory, notes);
      
      for await (const chunk of stream) {
        currentAiText += chunk;
        onSetHistory([...newHistory, {
          id: aiMsgId,
          role: 'assistant',
          text: currentAiText,
          timestamp: Date.now()
        }]);
      }

      const mentionedIds = notes.filter(n => currentAiText.includes(`[${n.id}]`)).map(n => n.id);
      if (mentionedIds.length > 0) {
        onSetHistory([...newHistory, {
          id: aiMsgId,
          role: 'assistant',
          text: currentAiText,
          timestamp: Date.now(),
          linkedNoteIds: mentionedIds
        }]);
      }
    } catch (err) {
      console.error(err);
      onSetHistory([...newHistory, {
        id: aiMsgId,
        role: 'assistant',
        text: "Neural link disrupted. Error synchronizing with Vault.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const getNoteById = (id: string) => notes.find(n => n.id === id);

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] max-w-4xl mx-auto w-full animate-in fade-in duration-700">
      {/* Active Knowledge Pills */}
      <div className="flex items-center gap-3 mb-6 px-4 overflow-x-auto py-2 no-scrollbar">
        <div className="flex items-center gap-2 bg-red-950/20 border border-red-900/40 px-3 py-1.5 rounded-full shrink-0">
          <Library size={12} className="text-red-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red-200">VAULT SYNC: {notes.length} NODES</span>
        </div>
        {notes.slice(0, 5).map(note => (
          <div key={note.id} className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800/80 px-3 py-1.5 rounded-full shrink-0 text-zinc-400 text-[10px] font-bold">
            <BookOpen size={10} className="text-zinc-600" /> {note.title}
          </div>
        ))}
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-8 px-4 pb-8 no-scrollbar scroll-smooth"
      >
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-8 opacity-70">
            <div className="w-24 h-24 bg-red-950/10 rounded-[2.5rem] flex items-center justify-center border border-red-900/20 shadow-[0_0_50px_rgba(220,38,38,0.05)]">
              <Brain size={48} className="text-red-600 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white tracking-tight">OMNICONCIERGE V2</h3>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto font-medium">Deep-neural interface active. Querying your knowledge graph for optimal synthesis.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
              <button onClick={() => setInput("Identify core themes in my vault.")} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 hover:border-red-500/30 hover:text-red-400 transition-all text-left flex items-center justify-between group">
                "Themes Synthesis" <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => setInput("What are my recent protocol updates?")} className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 hover:border-red-500/30 hover:text-red-400 transition-all text-left flex items-center justify-between group">
                "Recent Insights" <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-400`}>
            <div className={`max-w-[88%] space-y-4 ${msg.role === 'user' ? 'bg-red-950/20 border border-red-500/30' : 'bg-[#0f0f12] border border-zinc-800'} p-7 rounded-[2.5rem] shadow-2xl shadow-black/50`}>
              <div className="flex items-center gap-2 mb-2">
                {msg.role === 'assistant' ? (
                  <Brain size={16} className="text-red-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  </div>
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
                  {msg.role === 'assistant' ? 'OMNI-SYSTEM' : 'DIRECTOR'}
                </span>
              </div>
              
              <div className="text-sm leading-relaxed text-zinc-200">
                {msg.text.split('\n').map((para, i) => (
                  <p key={i} className="mb-3 last:mb-0">{para}</p>
                ))}
              </div>

              {msg.linkedNoteIds && msg.linkedNoteIds.length > 0 && (
                <div className="pt-5 mt-5 border-t border-zinc-800/50 space-y-4">
                  <p className="text-[9px] font-black text-red-700 uppercase tracking-[0.3em] flex items-center gap-2">
                    <BookOpen size={12} /> GROUNDED REFERENCES
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.linkedNoteIds.map(id => {
                      const note = getNoteById(id);
                      return note ? (
                        <button key={id} className="flex items-center gap-2 bg-red-500/5 border border-red-900/30 px-3 py-1.5 rounded-xl text-[10px] font-black text-red-400 hover:bg-red-900/20 transition-all uppercase">
                          {note.title} <ArrowUpRight size={10} />
                        </button>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-[#0f0f12] border border-zinc-800 p-6 rounded-[2.5rem] flex items-center gap-3">
              <RefreshCw size={14} className="text-red-600 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Synthesizing Neural Path...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="mt-auto px-4 py-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-red-600/5 blur-2xl group-focus-within:bg-red-600/10 transition-all" />
          <div className="relative bg-[#0d0d0f] border border-zinc-800 rounded-[2.5rem] p-2 flex items-center gap-2 shadow-2xl group-focus-within:border-red-600/40 transition-all overflow-hidden">
            <div className="pl-6 text-red-600">
              <Sparkles size={22} />
            </div>
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Query the Knowledge Graph..."
              className="flex-1 bg-transparent border-none py-5 text-sm text-white outline-none placeholder:text-zinc-700 font-medium"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!input.trim() || isTyping}
              className="w-14 h-14 bg-red-700 hover:bg-red-600 disabled:opacity-30 rounded-[1.8rem] flex items-center justify-center text-white transition-all active:scale-95 shadow-xl shadow-red-900/20 mr-1"
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Copilot;