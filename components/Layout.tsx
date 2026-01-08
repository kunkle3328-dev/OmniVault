import React from 'react';
import { View } from '../types';
import { LayoutDashboard, Book, Headphones, Microscope, BrainCircuit, Plus, Search, CheckCircle2, RefreshCw } from 'lucide-react';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  onAddNote: () => void;
  isSaving?: boolean;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, onAddNote, isSaving, children }) => {
  const navItems = [
    { id: View.DASHBOARD, icon: LayoutDashboard, label: 'HOME' },
    { id: View.VAULT, icon: Book, label: 'VAULT' },
    { id: View.STUDIO, icon: Headphones, label: 'STUDIO' },
    { id: View.RESEARCH_LAB, icon: Microscope, label: 'LAB' },
    { id: View.COPILOT, icon: BrainCircuit, label: 'COPILOT' },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#060608] text-[#e2e2e7] overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-red-950/20 bg-[#08080a]/90 backdrop-blur-3xl z-[90] shadow-2xl">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center group cursor-pointer" onClick={() => setView(View.DASHBOARD)}>
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_10px_rgba(153,27,27,0.5)] group-hover:scale-105 transition-transform duration-500">
               <path 
                d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z" 
                fill="none" 
                stroke="#991b1b" 
                strokeWidth="6" 
              />
              <circle cx="50" cy="50" r="16" fill="#991b1b" className="animate-pulse" />
            </svg>
            <span className="absolute text-[10px] md:text-xs font-black text-white pointer-events-none tracking-tight">Ω</span>
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-black tracking-[0.2em] md:tracking-[0.3em] uppercase text-white">OMNIVAULT</h1>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-zinc-700 uppercase tracking-widest">
               {isSaving ? (
                 <span className="flex items-center gap-1 text-red-700 animate-pulse">
                   <RefreshCw size={8} className="animate-spin" /> SYNCING...
                 </span>
               ) : (
                 <span className="flex items-center gap-1 text-red-900/60">
                   <CheckCircle2 size={8} /> NODES SECURED
                 </span>
               )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-red-950/20 rounded-full transition-all text-zinc-500 hover:text-red-700">
            <Search size={18} className="md:w-5 md:h-5" />
          </button>
          <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl border border-red-900/30 bg-zinc-950 flex items-center justify-center relative overflow-hidden group shadow-inner">
             <div className="absolute inset-0 bg-red-900/5 group-hover:bg-red-900/10 transition-all"></div>
             <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-900/30 border border-red-800 shadow-[0_0_8px_rgba(153,27,27,0.4)]" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32 pt-4 md:pt-8 px-4 md:px-10 max-w-6xl mx-auto w-full scroll-smooth no-scrollbar">
        {children}
      </main>

      {/* V2 Floating Bottom Nav Bar - Optimized for Mobile Scale */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-lg animate-in slide-in-from-bottom-4 duration-500">
        <div className="bg-[#121214]/95 backdrop-blur-3xl border border-white/5 p-1.5 md:p-2 rounded-[2rem] flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-0.5 flex-1 justify-around px-1 md:px-2">
            {navItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`flex flex-col items-center gap-1 transition-all py-1.5 px-2 md:px-3 rounded-xl ${
                    isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                  }`}
                >
                  <item.icon size={18} className={`${isActive ? 'text-red-700 drop-shadow-[0_0_6px_rgba(153,27,27,0.6)]' : ''} md:w-5 md:h-5 transition-all duration-300`} />
                  <span className={`text-[7px] md:text-[9px] font-black tracking-tighter md:tracking-widest ${isActive ? 'opacity-100' : 'opacity-40'} uppercase`}>{item.label}</span>
                  {isActive && (
                    <div className="w-1 h-1 bg-red-700 rounded-full animate-pulse mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="w-px h-8 bg-white/5 mx-1 md:mx-2"></div>
          
          <button 
            onClick={onAddNote}
            className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-800 to-[#310808] text-white rounded-[1.2rem] md:rounded-[1.5rem] shadow-[0_8px_20px_rgba(153,27,27,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all mr-0.5 group border border-red-700/20"
          >
            <Plus size={24} className="md:w-7 md:h-7 group-hover:rotate-90 transition-transform duration-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Layout;