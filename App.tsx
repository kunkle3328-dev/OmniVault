
import React, { useState, useEffect, useMemo } from 'react';
import { View, Note, ChatMessage } from './types';
import { INITIAL_NOTES } from './constants';
import Layout from './components/Layout';
import NoteCard from './components/NoteCard';
import NoteModal from './components/NoteModal';
import GraphView from './components/GraphView';
import VoiceConcierge from './components/VoiceConcierge';
import ResearchLab from './components/ResearchLab';
import WebImporter from './components/WebImporter';
import SplashScreen from './components/SplashScreen';
import { Send, Sparkles, Wand2, Search, Library, ArrowRight, Brain, AlertCircle, Share2, History, Microscope, CheckCircle2 } from 'lucide-react';
import { performSmartLookup, chatWithVault } from './services/geminiService';

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Persisted States
  const [view, setView] = useState<View>(() => {
    const saved = localStorage.getItem('omnivault_view');
    if (saved && Object.values(View).includes(saved as View)) {
      return saved as View;
    }
    return View.DASHBOARD;
  });
  
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('omnivault_notes');
    return saved ? JSON.parse(saved) : INITIAL_NOTES;
  });
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('omnivault_chat');
    return saved ? JSON.parse(saved) : [];
  });

  const [chatInput, setChatInput] = useState('');
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState<{ notes: Note[], summary: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // Persistence Effects
  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('omnivault_notes', JSON.stringify(notes));
    localStorage.setItem('omnivault_view', view);
    localStorage.setItem('omnivault_chat', JSON.stringify(chatHistory));
    
    const timer = setTimeout(() => setIsSaving(false), 800);
    return () => clearTimeout(timer);
  }, [notes, view, chatHistory]);

  const notesContextString = useMemo(() => 
    notes.map(n => `ID: ${n.id} TITLE: ${n.title} CONTENT: ${n.content}`).join('\n---\n'),
  [notes]);

  if (isInitializing) {
    return <SplashScreen onComplete={() => setIsInitializing(false)} />;
  }

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: chatInput, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await chatWithVault(userMsg.text, chatHistory, notes);
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', text: response || "...", timestamp: Date.now() };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (err) {
      setError("Vault Copilot is busy. Check your credentials.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleSaveNote = (noteData: Partial<Note>) => {
    if (activeNote) {
      setNotes(prev => prev.map(n => n.id === activeNote.id ? { ...n, ...noteData, updatedAt: Date.now() } : n));
    } else {
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteData.title || 'Untitled Research',
        content: noteData.content || '',
        tags: noteData.tags || [],
        updatedAt: Date.now(),
        connections: [],
        sourceUrl: noteData.sourceUrl
      };
      setNotes(prev => [newNote, ...prev]);
    }
    setIsNoteModalOpen(false);
  };

  const handleImportResearch = (data: Partial<Note>) => {
    handleSaveNote(data);
    setView(View.VAULT);
  };

  const clearChat = () => {
    if (window.confirm("Purge conversation history?")) {
      setChatHistory([]);
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <VoiceConcierge notesContext={notesContextString} />

      <section className="bg-gradient-to-br from-purple-900/20 to-indigo-900/10 border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Brain size={120} />
        </div>
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="text-purple-400" />
          Intelligence Dashboard
        </h2>
        <p className="text-zinc-400 text-sm mb-6 max-w-md">
          Explore your local knowledge graph or launch a new deep research session.
        </p>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => setView(View.RESEARCH_LAB)} 
            className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 py-4 rounded-xl font-bold text-emerald-400 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/5 cursor-pointer z-10"
          >
            Research Lab <Microscope size={18} />
          </button>
          <button 
            type="button"
            onClick={() => setView(View.WEB_IMPORT)} 
            className="flex-1 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 py-4 rounded-xl font-bold text-blue-400 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-500/5 cursor-pointer z-10"
          >
            Web Importer <Share2 size={18} />
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Library className="text-zinc-500" />
            Active Vault
          </h2>
          <button onClick={() => setView(View.VAULT)} className="text-sm text-purple-400 font-bold hover:underline">Full Library</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.slice(0, 4).map(note => (
            <NoteCard key={note.id} note={note} onClick={(n) => { setActiveNote(n); setIsNoteModalOpen(true); }} />
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <Layout 
      currentView={view} 
      setView={setView} 
      onAddNote={() => { setActiveNote(null); setIsNoteModalOpen(true); }}
      isSaving={isSaving}
    >
      {view === View.DASHBOARD && renderDashboard()}
      {view === View.RESEARCH_LAB && <ResearchLab vaultContext={notesContextString} onImport={handleImportResearch} />}
      {view === View.WEB_IMPORT && <WebImporter onAdd={handleSaveNote} />}
      {view === View.VAULT && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">The Vault</h2>
            <div className="text-[10px] font-mono text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full uppercase">
              Encrypted Local Storage
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map(note => <NoteCard key={note.id} note={note} onClick={(n) => { setActiveNote(n); setIsNoteModalOpen(true); }} />)}
          </div>
        </div>
      )}
      {view === View.SMART_LOOKUP && (
        <div className="space-y-6">
          <div className="bg-[#16161a] p-6 rounded-2xl border border-[#27272a]">
            <h2 className="text-2xl font-bold mb-4">Smart Lookup</h2>
            <div className="flex gap-2">
              <input value={lookupQuery} onChange={(e) => setLookupQuery(e.target.value)} placeholder="Semantic search..." className="flex-1 bg-[#0d0d0f] border border-[#27272a] rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-purple-500" />
              <button onClick={async () => {
                setIsTyping(true);
                const res = await performSmartLookup(lookupQuery, notes);
                setLookupResults(res);
                setIsTyping(false);
              }} className="bg-purple-600 px-6 rounded-xl font-bold">{isTyping ? '...' : 'Search'}</button>
            </div>
          </div>
          {lookupResults && (
            <div className="space-y-6">
              <div className="p-4 bg-purple-900/10 border-l-4 border-purple-500 text-zinc-300 italic">{lookupResults.summary}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lookupResults.notes.map(n => <NoteCard key={n.id} note={n} onClick={(nn) => { setActiveNote(nn); setIsNoteModalOpen(true); }} />)}
              </div>
            </div>
          )}
        </div>
      )}
      {view === View.COPILOT && (
        <div className="flex flex-col h-[calc(100vh-14rem)] space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Conversational Context</h2>
            <button onClick={clearChat} className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors uppercase font-bold">Purge History</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
            {chatHistory.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-30">
                <Brain size={48} className="mb-4" />
                <p className="text-sm italic">Vault Copilot is standing by. Ask anything about your stored knowledge.</p>
              </div>
            )}
            {chatHistory.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-purple-600 shadow-lg shadow-purple-600/10 text-white' : 'bg-[#16161a] border border-[#27272a] text-zinc-200'}`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            {isTyping && <div className="text-zinc-500 text-[10px] font-mono animate-pulse uppercase tracking-widest px-2">Synthesizing Response...</div>}
          </div>
          <div className="flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} className="flex-1 bg-[#16161a] border border-[#27272a] rounded-xl p-4 outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-700" placeholder="Message Copilot..." />
            <button onClick={handleChat} className="bg-purple-600 p-4 rounded-xl hover:bg-purple-700 transition-colors active:scale-95"><Send size={20} /></button>
          </div>
        </div>
      )}
      {view === View.GRAPH && <GraphView notes={notes} onSelect={(n) => { setActiveNote(n); setIsNoteModalOpen(true); }} />}
      
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
