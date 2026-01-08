import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Note, ChatMessage } from './types';
import { INITIAL_NOTES } from './constants';
import Layout from './components/Layout';
import NoteCard from './components/NoteCard';
import NoteModal from './components/NoteModal';
import VoiceConcierge from './components/VoiceConcierge';
import ResearchLab from './components/ResearchLab';
import SplashScreen from './components/SplashScreen';
import SynthesisStudio from './components/SynthesisStudio';
import Copilot from './components/Copilot';
import { Sparkles, Library, Headphones, Microscope, AlertCircle, X, Brain, ChevronRight } from 'lucide-react';
import { generateNoteVisual } from './services/geminiService';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [view, setView] = useState<View>(() => {
    try {
      const saved = localStorage.getItem('omnivault_view');
      if (saved && Object.values(View).includes(saved as View)) return saved as View;
    } catch (e) {}
    return View.DASHBOARD;
  });
  
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('omnivault_notes');
      if (!saved) return INITIAL_NOTES;
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : INITIAL_NOTES;
    } catch (e) { return INITIAL_NOTES; }
  });
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('omnivault_chat');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [error, setError] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  useEffect(() => {
    localStorage.setItem('omnivault_notes', JSON.stringify(notes));
    localStorage.setItem('omnivault_view', view);
    localStorage.setItem('omnivault_chat', JSON.stringify(chatHistory));
  }, [notes, view, chatHistory]);

  const notesContextString = useMemo(() => 
    notes.map(n => `TITLE: ${n.title} CONTENT: ${n.content}`).join('\n---\n'),
  [notes]);

  const handleSaveNote = (noteData: Partial<Note>) => {
    const isUpdate = activeNote !== null;
    const noteId = isUpdate ? activeNote!.id : `vlt_${Date.now()}`;
    
    const updatedNote: Note = {
      id: noteId,
      title: noteData.title || 'Untitled Insight',
      content: noteData.content || '',
      tags: noteData.tags || [],
      updatedAt: Date.now(),
      imageUrl: isUpdate ? activeNote!.imageUrl : undefined
    };

    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== noteId);
      return [updatedNote, ...filtered];
    });
    
    setIsNoteModalOpen(false);

    if (!updatedNote.imageUrl && updatedNote.content.length > 20) {
      generateNoteVisual(updatedNote.title, updatedNote.content).then(url => {
        if (url) setNotes(prev => prev.map(n => n.id === noteId ? { ...n, imageUrl: url } : n));
      });
    }
  };

  if (isInitializing) return <SplashScreen onComplete={() => setIsInitializing(false)} />;

  return (
    <Layout 
      currentView={view} 
      setView={setView} 
      onAddNote={() => { setActiveNote(null); setIsNoteModalOpen(true); }}
      isSaving={isSaving}
    >
      {/* Global Error Toast */}
      {error && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-sm px-4 animate-in slide-in-from-top-2">
          <div className="bg-[#1a0505]/95 backdrop-blur-2xl border border-red-800/40 p-3 rounded-xl flex items-start gap-3 shadow-2xl">
            <div className="bg-red-800/20 p-1.5 rounded-lg">
              <AlertCircle className="text-red-500" size={16} />
            </div>
            <div className="flex-1">
              <h4 className="text-white text-xs font-bold tracking-tight">System Alert</h4>
              <p className="text-red-200/60 text-[10px] leading-tight mt-0.5">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/10 rounded-md text-zinc-600">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {view === View.DASHBOARD && (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <VoiceConcierge notesContext={notesContextString} />
          
          <section className="bg-gradient-to-br from-[#120505] via-[#08080a] to-black border border-red-900/10 rounded-[1.8rem] md:rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 p-4 md:p-6 opacity-5 group-hover:scale-110 pointer-events-none">
              <Brain size={120} className="md:w-[200px] md:h-[200px] text-red-900" />
            </div>
            <div className="relative z-10">
              <h2 className="text-xl md:text-3xl font-black mb-2 md:mb-3 flex items-center gap-3 md:gap-4 tracking-tight">
                <Sparkles className="text-red-600 w-5 h-5 md:w-7 md:h-7" size={28} /> 
                Intelligence Center
              </h2>
              <p className="text-zinc-500 text-[10px] md:text-sm mb-6 md:mb-10 max-w-sm font-medium leading-relaxed">Ground your data via deep-red synthesis protocols.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                <button onClick={() => setView(View.STUDIO)} className="group bg-red-950/20 hover:bg-red-900/30 border border-red-900/20 py-4 md:py-6 rounded-xl md:rounded-2xl font-black text-xs md:text-sm text-red-600 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                  Synthesis Studio <Headphones size={18} className="md:w-5 md:h-5 group-hover:rotate-6" />
                </button>
                <button onClick={() => setView(View.RESEARCH_LAB)} className="group bg-zinc-900/30 hover:bg-zinc-800/50 border border-zinc-800/80 py-4 md:py-6 rounded-xl md:rounded-2xl font-black text-xs md:text-sm text-zinc-500 hover:text-white flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
                  Research Lab <Microscope size={18} className="md:w-5 md:h-5 group-hover:-rotate-6" />
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4 md:mb-8 px-1">
              <h2 className="text-lg md:text-2xl font-black flex items-center gap-3 tracking-tight">
                <Library className="text-zinc-800 w-5 h-5 md:w-6 md:h-6" /> 
                Recent Insights
              </h2>
              <button onClick={() => setView(View.VAULT)} className="text-[8px] md:text-[10px] text-red-800 font-black uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1 group">
                Vault Index <ChevronRight size={12} className="group-hover:translate-x-0.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {notes.slice(0, 4).map(note => (
                <NoteCard key={note.id} note={note} onClick={(n) => { setActiveNote(n); setIsNoteModalOpen(true); }} />
              ))}
            </div>
          </section>
        </div>
      )}

      {view === View.RESEARCH_LAB && <ResearchLab vaultContext={notesContextString} onImport={handleSaveNote} />}
      {view === View.STUDIO && <SynthesisStudio notes={notes} />}
      {view === View.VAULT && (
        <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500 pb-32">
          <header className="flex items-center justify-between px-1">
            <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white">The Vault</h2>
            <div className="text-[8px] md:text-[10px] font-black text-zinc-600 border border-zinc-900 px-3 md:px-6 py-1 md:py-2 rounded-full uppercase tracking-widest">Active Store</div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {notes.map(note => <NoteCard key={note.id} note={note} onClick={(n) => { setActiveNote(n); setIsNoteModalOpen(true); }} />)}
          </div>
        </div>
      )}
      {view === View.COPILOT && (
        <Copilot 
          notes={notes} 
          chatHistory={chatHistory} 
          onSetHistory={setChatHistory} 
          onAddNote={handleSaveNote}
        />
      )}
      
      <NoteModal 
        isOpen={isNoteModalOpen} 
        note={activeNote} 
        allNotes={notes}
        onClose={() => setIsNoteModalOpen(false)} 
        onSave={handleSaveNote} 
        onDelete={(id) => setNotes(n => n.filter(x => x.id !== id))} 
      />
    </Layout>
  );
};

export default App;