
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Note } from '../types';
import { X, Save, Trash2, Bold, Italic, List, Type, Tag as TagIcon,AtSign, Search } from 'lucide-react';

interface NoteModalProps {
  note: Note | null;
  allNotes: Note[]; // Added to provide context for links and tags
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

  // Derive unique tags from all notes for suggestions
  const allExistingTags = useMemo(() => {
    const tags = new Set<string>();
    allNotes.forEach(n => n.tags.forEach(t => tags.add(t)));
    return Array.from(tags);
  }, [allNotes]);

  const tagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    return allExistingTags.filter(t => 
      t.toLowerCase().includes(tagInput.toLowerCase()) && !activeTags.includes(t)
    ).slice(0, 5);
  }, [tagInput, allExistingTags, activeTags]);

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
      setActiveTags(note.tags);
    } else {
      setTitle('');
      setContent('');
      setActiveTags([]);
    }
    setTagInput('');
    setMentionQuery(null);
  }, [note, isOpen]);

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = `${before}${prefix}${selectedText}${suffix}${after}`;
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

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
    const after = content.substring(textareaRef.current?.selectionStart || 0);
    const newText = `${before}[[${noteTitle}]]${after}`;
    setContent(newText);
    setMentionQuery(null);
    textareaRef.current?.focus();
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !activeTags.includes(cleanTag)) {
      setActiveTags([...activeTags, cleanTag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setActiveTags(activeTags.filter(t => t !== tagToRemove));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#16161a] border border-[#27272a] rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-8 py-5 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${note ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Type size={20} />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {note ? 'Refine Knowledge' : 'Capture Insight'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#27272a] rounded-full transition-colors text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2 px-1">Concept Title</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0d0d0f] border border-[#27272a] rounded-2xl py-4 px-5 focus:ring-2 focus:ring-purple-500 outline-none text-white text-lg font-medium placeholder:text-zinc-700 transition-all"
              placeholder="e.g. Synthesis of Martian Soil"
            />
          </div>

          <div className="space-y-2 relative">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-2 px-1">Structured Content</label>
            
            <div className="flex items-center gap-1 p-1 bg-[#0d0d0f] border border-[#27272a] rounded-t-2xl">
              <button onClick={() => insertFormatting('**', '**')} className="p-2.5 hover:bg-[#1f1f23] rounded-xl text-zinc-400 hover:text-white transition-all"><Bold size={16} /></button>
              <button onClick={() => insertFormatting('*', '*')} className="p-2.5 hover:bg-[#1f1f23] rounded-xl text-zinc-400 hover:text-white transition-all"><Italic size={16} /></button>
              <button onClick={() => insertFormatting('\n- ', '')} className="p-2.5 hover:bg-[#1f1f23] rounded-xl text-zinc-400 hover:text-white transition-all"><List size={16} /></button>
              <div className="w-px h-6 bg-[#27272a] mx-1"></div>
              <span className="text-[10px] text-zinc-600 px-2 font-mono italic">Markdown + @ Mention Links</span>
            </div>

            <textarea 
              ref={textareaRef}
              value={content}
              onChange={handleTextareaChange}
              className="w-full bg-[#0d0d0f] border-x border-b border-[#27272a] rounded-b-2xl py-5 px-5 focus:ring-2 focus:ring-purple-500 outline-none text-zinc-300 min-h-[250px] leading-relaxed resize-none font-sans placeholder:text-zinc-800 transition-all"
              placeholder="Detail the research... Type @ to link another note."
            />

            {/* Mention Suggestions UI */}
            {mentionQuery !== null && noteSuggestions.length > 0 && (
              <div className="absolute left-4 right-4 bottom-full mb-2 bg-[#1f1f23] border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden z-[110] animate-in slide-in-from-bottom-2">
                <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/20 text-[10px] font-bold text-purple-400 uppercase tracking-widest">Link Note</div>
                {noteSuggestions.map(n => (
                  <button 
                    key={n.id} 
                    onClick={() => insertMention(n.title)}
                    className="w-full text-left px-4 py-3 hover:bg-purple-500/20 transition-colors flex items-center justify-between group"
                  >
                    <span className="text-zinc-200 group-hover:text-white font-medium">{n.title}</span>
                    <AtSign size={14} className="text-zinc-600 group-hover:text-purple-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 px-1">Taxonomy (Tags)</label>
            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-4 bg-[#0d0d0f] border border-[#27272a] rounded-2xl">
              {activeTags.length === 0 && <span className="text-zinc-700 text-xs italic">No tags assigned...</span>}
              {activeTags.map(tag => (
                <span key={tag} className="flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded-xl text-xs font-mono">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            
            <div className="relative">
              <input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag(tagInput)}
                className="w-full bg-[#0d0d0f] border border-[#27272a] rounded-2xl py-4 px-10 focus:ring-2 focus:ring-purple-500 outline-none text-zinc-400 font-mono text-sm placeholder:text-zinc-800 transition-all"
                placeholder="Type and press Enter to add tags..."
              />
              <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              
              {/* Tag Suggestions */}
              {tagSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-[#1f1f23] border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  {tagSuggestions.map(tag => (
                    <button 
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-purple-400 flex items-center gap-2"
                    >
                      <Search size={14} />
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-[#1f1f23]/50 border-t border-[#27272a] flex items-center justify-between">
          <div>
            {note && onDelete && (
              <button onClick={() => { onDelete(note.id); onClose(); }} className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-widest group">
                <Trash2 size={16} className="group-hover:animate-pulse" /> Purge
              </button>
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-3 rounded-2xl text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-white transition-all">Discard</button>
            <button onClick={() => {
              onSave({ title, content, tags: activeTags });
              onClose();
            }} className="flex items-center gap-3 bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-xl shadow-purple-500/20 active:scale-95 group">
              <Save size={18} /> Commit to Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;
