
import React from 'react';
import { View } from '../types';
import { LayoutDashboard, Book, BrainCircuit, Search, Plus, Share2, Microscope, Globe, Shield, CheckCircle2, RefreshCw } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  onAddNote: () => void;
  isSaving?: boolean;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, onAddNote, isSaving, children }) => {
  const navItems = [
    { id: View.DASHBOARD, icon: LayoutDashboard, label: 'Home' },
    { id: View.VAULT, icon: Book, label: 'Vault' },
    { id: View.RESEARCH_LAB, icon: Microscope, label: 'Lab' },
    { id: View.WEB_IMPORT, icon: Share2, label: 'Import' },
    { id: View.COPILOT, icon: BrainCircuit, label: 'Copilot' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0c] text-[#e2e2e7] overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f23] bg-[#0d0d0f]/80 backdrop-blur-xl z-[90]">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">
               <path 
                d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z" 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth="4" 
              />
              <circle cx="50" cy="50" r="15" fill="#a855f7" className="animate-pulse" />
            </svg>
            <span className="absolute text-xs font-black text-white pointer-events-none">Ω</span>
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.2em] uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-600">OmniVault</h1>
            <div className="flex items-center gap-2 text-[8px] font-mono text-zinc-500">
               {isSaving ? (
                 <span className="flex items-center gap-1 text-purple-400 animate-pulse">
                   <RefreshCw size={8} className="animate-spin" /> SYNCING VAULT...
                 </span>
               ) : (
                 <span className="flex items-center gap-1">
                   <CheckCircle2 size={8} className="text-emerald-500" /> ALL INSIGHTS SAVED
                 </span>
               )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setView(View.SMART_LOOKUP)} className="p-2 hover:bg-[#1f1f23] rounded-full transition-colors">
            <Search size={18} className="text-zinc-400" />
          </button>
          <div className="w-8 h-8 rounded-full border border-purple-500/30 overflow-hidden bg-zinc-900 flex items-center justify-center">
             <div className="w-4 h-4 rounded-full bg-purple-500/20 border border-purple-500/50" />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 pt-4 px-4 md:px-8 max-w-5xl mx-auto w-full scroll-smooth custom-scrollbar">
        {children}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#121214]/90 backdrop-blur-2xl border border-white/10 px-4 py-3 flex items-center gap-4 z-[90] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:gap-8 transition-all">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex flex-col items-center gap-1 transition-all relative group ${
              currentView === item.id ? 'text-purple-400 scale-110' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]' : ''} />
            <span className="text-[8px] font-bold uppercase tracking-tighter">{item.label}</span>
            {currentView === item.id && (
               <div className="absolute -bottom-1 w-1 h-1 bg-purple-400 rounded-full" />
            )}
          </button>
        ))}
        <div className="w-px h-8 bg-white/10 mx-1"></div>
        <button 
          onClick={onAddNote}
          className="w-10 h-10 bg-purple-600 text-white rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center hover:bg-purple-700 transition-all hover:scale-110 active:scale-95"
        >
          <Plus size={24} />
        </button>
      </nav>
    </div>
  );
};

export default Layout;
