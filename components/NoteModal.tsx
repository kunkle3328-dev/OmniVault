import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Note } from '../types';
import { X, Save, Type, Tag as TagIcon, AtSign, Zap, Sparkles, Link as LinkIcon, Trash2, Plus } from 'lucide-react';

interface NoteModalProps {
  note: Note | null;
  allNotes: Note[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: Partial<Note>) => void;
  onDelete?: (id: string) => void;
}

const NoteModal: React.FC<NoteModalProps> = ({ note, allNotes, isOpen, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const backlinks = useMemo(() => {
    if (!note) return [];
    return allNotes.filter(n => n.content.includes(`[[${note.title}]]`) || n.content.includes(note.title));
  }, [note, allNotes]);

  const noteSuggestions = useMemo(() => {
    if (mentionQuery === null) return [];
    return allNotes.filter(n => 
      n.title.toLowerCase().includes(mentionQuery.toLowerCase())
    ).slice(0, 5);
  }, [mentionQuery, allNotes]);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setActiveTags(note.tags || []);
    } else {
      setTitle('');
      setContent('');
      setActiveTags([]);
    }
  }, [note, isOpen]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    const selectionStart = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, selectionStart);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    if (lastAtSymbol !== -1 && (lastAtSymbol === 0 || /\s/.test(textBeforeCursor[lastAtSymbol - 1]))) {
      const query = textBeforeCursor.substring(lastAtSymbol + 1);
      if (!/\s/.test(query)) {
        setMentionQuery(query);
        setMentionIndex(lastAtSymbol);
        return;
      }
    }
    setMentionQuery(null);
  };

  const insertMention = (noteTitle: string) => {
    if (mentionIndex === -1) return;
    const before = content.substring(0, mentionIndex);
    const selectionStart = textareaRef.current?.selectionStart || mentionIndex + (mentionQuery?.length || 0) + 1;
    const after = content.substring(selectionStart);
    setContent(`${before}[[${noteTitle}]]${after}`);
    setMentionQuery(null);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const addTag = () => {
    if (tagInput.trim() && !activeTags.includes(tagInput.trim())) {
      setActiveTags([...activeTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-[#0f0f12] border border-red-900/20 rounded-[1.5rem] md:rounded-[3rem] w-full max-w-5xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col md:flex-row h-[90vh] md:h-[80vh]">
        
        {/* Main Editor Section */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-900/50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 md:px-10 md:py-6 border-b border-zinc-900/50 bg-zinc-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2 md:p-3 rounded-xl bg-red-950/30 text-red-600 border border-red-900/20">
                <Type size={18} className="md:w-6 md:h-6" />
              </div>
              <h2 className="text-sm md:text-xl font-black text-white tracking-widest uppercase">NODE REFINE</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-900 rounded-full transition-colors text-zinc-500">
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          {/* Editor Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-4 md:space-y-6 no-scrollbar">
            <div className="space-y-1">
              <label className="text-[8px] md:text-[10px] font-black text-red-900/60 uppercase tracking-widest">Knowledge Label</label>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent border-none text-xl md:text-4xl font-black text-white outline-none placeholder:text-zinc-800 tracking-tighter"
                placeholder="INSIGHT_TITLE..."
              />
            </div>

            {/* Enhanced Tag System for Mobile Integration */}
            <div className="space-y-2">
              <label className="text-[8px] md:text-[10px] font-black text-zinc-700 uppercase tracking-widest">Semantic Metadata</label>
              <div className="flex flex-wrap items-center gap-2">
                {activeTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1.5 bg-red-950/20 text-red-600 border border-red-900/20 px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest group">
                    {tag}
                    <button onClick={() => setActiveTags(prev => prev.filter(t => t !== tag))} className="opacity-30 hover:opacity-100 transition-all"><X size={10} /></button>
                  </span>
                ))}
                
                <div className="flex items-center bg-zinc-950/50 border border-zinc-900 rounded-lg overflow-hidden group focus-within:border-red-900/50 transition-all">
                  <input 
                    value={tagInput} 
                    onChange={e => setTagInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && addTag()} 
                    className="bg-transparent px-3 py-1 text-[9px] md:text-xs text-zinc-400 outline-none w-24 md:w-32 placeholder:text-zinc-800" 
                    placeholder="New Tag..." 
                  />
                  <button 
                    onClick={addTag}
                    disabled={!tagInput.trim()}
                    className="bg-red-950/30 text-red-700 hover:text-red-500 px-2 py-1 transition-all disabled:opacity-0"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1 relative flex-1 flex flex-col">
              <label className="text-[8px] md:text-[10px] font-black text-zinc-700 uppercase tracking-widest">Neural Log</label>
              <textarea 
                ref={textareaRef}
                value={content}
                onChange={handleTextareaChange}
                className="flex-1 w-full bg-[#08080a] border border-zinc-900 rounded-xl md:rounded-[2rem] py-4 px-4 md:py-8 md:px-8 focus:border-red-800/50 outline-none text-zinc-400 leading-relaxed resize-none font-sans transition-all text-xs md:text-lg shadow-inner min-h-[250px]"
                placeholder="Initiate entry... Mention nodes with @"
              />

              {mentionQuery !== null && (
                <div className="absolute left-2 right-2 bottom-full mb-2 z-[1100]">
                  <div className="bg-[#16161a] border border-red-900/40 rounded-xl shadow-2xl overflow-hidden max-w-[280px]">
                    <div className="px-3 py-1.5 bg-red-950/30 border-b border-red-900/30 text-[7px] font-black text-red-500 uppercase tracking-widest flex items-center justify-between">
                      <span>SYNC_SUGGESTIONS</span>
                      <Sparkles size={8} />
                    </div>
                    {noteSuggestions.map(n => (
                      <button 
                        key={n.id} 
                        onClick={() => insertMention(n.title)}
                        className="w-full text-left px-4 py-2 hover:bg-red-900/20 transition-colors flex items-center justify-between group border-b border-zinc-900/30"
                      >
                        <span className="text-zinc-400 group-hover:text-white font-black text-[9px] truncate uppercase">{n.title}</span>
                        <AtSign size={12} className="text-zinc-800 group-hover:text-red-700" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-4 py-4 md:px-10 md:py-8 bg-[#08080a]/80 border-t border-zinc-900 flex items-center justify-between">
            <div className="flex gap-4 md:gap-8">
              <button 
                onClick={() => { if (note && onDelete) { onDelete(note.id); onClose(); } }} 
                className="text-zinc-800 hover:text-red-800 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} className="md:w-4 md:h-4" />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest hidden sm:inline">PURGE_NODE</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-zinc-700 hover:text-white font-black text-[9px] md:text-[11px] uppercase tracking-widest transition-all">DISCARD</button>
              <button 
                onClick={() => { if (title.trim()) { onSave({ title, content, tags: activeTags }); onClose(); } }} 
                className="bg-red-800 hover:bg-red-700 text-white px-5 py-2 md:px-10 md:py-4 rounded-lg md:rounded-2xl font-black shadow-lg transition-all flex items-center gap-2 uppercase tracking-widest text-[9px] md:text-xs"
              >
                <Save size={14} className="md:w-5 md:h-5" /> COMMIT_NODE
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar (Desktop) / Hidden on small screens for cleaner mobile flow */}
        <div className="hidden md:flex w-80 bg-[#08080a] flex-col overflow-hidden">
          <div className="p-8 border-b border-zinc-900 bg-zinc-950/30">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-red-900/60">NODE_GRAPH</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
            <div className="space-y-4">
               <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2"><LinkIcon size={12}/> BIDIRECTIONAL_LINKS</h4>
               <div className="space-y-2">
                 {backlinks.length === 0 ? (
                   <p className="text-[9px] italic text-zinc-800 uppercase font-black">Isolated Entity</p>
                 ) : (
                  backlinks.map(bl => (
                    <div key={bl.id} className="p-3 bg-[#0f0f12] border border-zinc-900 rounded-xl group hover:border-red-900/30 transition-all cursor-pointer">
                      <p className="text-[10px] font-black text-zinc-500 group-hover:text-red-600 transition-colors uppercase truncate">{bl.title}</p>
                    </div>
                  ))
                 )}
               </div>
            </div>

            <div className="p-6 bg-red-950/10 border border-red-900/20 rounded-2xl space-y-3">
               <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-red-600">
                 <Zap size={12} className="fill-red-600" /> SYSTEM_ADVICE
               </div>
               <p className="text-[10px] text-zinc-600 leading-relaxed font-bold uppercase">Cross-reference with [SYNT_INTEL] nodes for optimized Vault synthesis.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;