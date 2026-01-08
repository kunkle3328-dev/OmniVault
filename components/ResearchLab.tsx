import React, { useState } from 'react';
import { Microscope, Search, Link as LinkIcon, Download, Sparkles, Globe, RefreshCw, CheckCircle2, ChevronRight } from 'lucide-react';
import { researchWithGrounding } from '../services/geminiService';
import { GroundedResult, Note } from '../types';

interface Props {
  vaultContext: string;
  onImport: (noteData: Partial<Note>) => void;
}

const ResearchLab: React.FC<Props> = ({ vaultContext, onImport }) => {
  const [query, setQuery] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [result, setResult] = useState<GroundedResult | null>(null);

  const handleResearch = async () => {
    if (!query.trim()) return;
    setIsResearching(true);
    setResult(null);
    try {
      const data = await researchWithGrounding(query, vaultContext);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsResearching(false);
    }
  };

  const handleImport = () => {
    if (!result) return;
    onImport({
      title: `SYNT_INTEL: ${query.toUpperCase()}`,
      content: result.text,
      tags: ['lab-output', 'v2-synthesis'],
      updatedAt: Date.now()
    });
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col gap-2 md:gap-3">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="bg-[#121214] p-3 md:p-5 rounded-2xl md:rounded-3xl border border-red-900/30 shadow-[0_0_20px_rgba(153,27,27,0.1)]">
            <Microscope className="text-red-700 w-6 h-6 md:w-10 md:h-10" />
          </div>
          <h2 className="text-2xl md:text-5xl font-black text-white tracking-tight">Research Lab</h2>
        </div>
        <p className="text-zinc-500 text-xs md:text-sm font-medium ml-1 max-w-xl leading-relaxed">Grounding your Vault with real-time web intelligence via red-tier probes.</p>
      </header>

      {/* Unified Research Input Card - Compacted for Mobile */}
      <div className="bg-[#0f0f12] border border-red-900/10 rounded-[2rem] md:rounded-[3.5rem] p-4 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6">
          <div className="flex-1 w-full relative group">
            <div className="relative flex items-center bg-[#08080a] border border-zinc-900 rounded-[1.5rem] md:rounded-[2.5rem] px-4 md:px-8 py-3 md:py-5 focus-within:border-red-800/50 transition-all shadow-inner">
              <div className="flex items-center gap-2 md:gap-3 pr-3 md:pr-6 border-r border-zinc-900">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-black border border-zinc-800 rounded-xl md:rounded-2xl flex items-center justify-center text-zinc-600 relative group/g">
                  <Globe size={20} className="md:w-7 md:h-7 group-hover/g:text-red-700 transition-colors" />
                  <span className="absolute -top-1 -right-1 bg-red-700 text-white text-[8px] md:text-[10px] font-black w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center border-2 md:border-4 border-[#08080a] shadow-lg">G</span>
                </div>
              </div>
              <input 
                value={query} 
                onChange={e => setQuery(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleResearch()} 
                placeholder="Initialize Query..." 
                className="flex-1 bg-transparent border-none py-1 pl-3 md:pl-6 text-sm md:text-xl text-white outline-none placeholder:text-zinc-800 font-bold tracking-tight" 
              />
            </div>
          </div>
          <button 
            onClick={handleResearch} 
            disabled={isResearching || !query.trim()} 
            className="w-full md:w-auto group bg-red-950/40 hover:bg-red-900/40 disabled:opacity-30 text-red-700 hover:text-red-500 px-6 md:px-12 py-4 md:py-7 rounded-[1.2rem] md:rounded-[2.5rem] font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-3 border border-red-900/30 shadow-2xl transition-all active:scale-[0.97]"
          >
            {isResearching ? <RefreshCw className="animate-spin" size={16} /> : <Search size={18} className="md:w-5 md:h-5" />} 
            RESEARCH
            <ChevronRight size={16} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {isResearching && (
        <div className="flex flex-col items-center justify-center py-20 md:py-32 space-y-4 md:space-y-8">
          <div className="relative w-16 h-16 md:w-24 md:h-24">
            <div className="absolute inset-0 border-2 md:border-4 border-red-900/10 rounded-full"></div>
            <div className="absolute inset-0 border-2 md:border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-red-800 font-black text-[8px] md:text-[10px] uppercase tracking-[0.4em] md:tracking-[0.6em] animate-pulse">Engaging Probe...</p>
        </div>
      )}

      {result && (
        <div className="animate-in slide-in-from-bottom-6 duration-500 bg-[#0f0f12] border border-red-900/20 rounded-[2rem] md:rounded-[3rem] p-6 md:p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 md:w-2 h-full bg-red-800"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-12 gap-4">
            <div className="flex items-center gap-3 md:gap-4 bg-red-950/20 px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl border border-red-900/30">
              <Sparkles className="text-red-700 w-4 h-4 md:w-6 md:h-6" />
              <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest md:tracking-[0.35em] text-red-500">Grounded Synthesis</span>
            </div>
            <button onClick={handleImport} className="w-full sm:w-auto flex items-center justify-center gap-2 md:gap-3 bg-red-800 hover:bg-red-700 text-white px-6 md:px-10 py-3 md:py-5 rounded-xl md:rounded-[2rem] font-black uppercase text-[10px] md:text-xs tracking-widest shadow-xl transition-all active:scale-95 group">
              {importSuccess ? <CheckCircle2 size={16} /> : <Download size={16} className="md:w-5 md:h-5 group-hover:translate-y-0.5 transition-transform" />} Commit Node
            </button>
          </div>
          
          <div className="prose prose-invert max-w-none text-zinc-400 leading-relaxed text-sm md:text-xl mb-10 md:mb-16 font-medium">
            {result.text.split('\n').map((para, i) => (
              <p key={i} className="mb-4 md:mb-6 last:mb-0">{para}</p>
            ))}
          </div>

          {result.sources.length > 0 && (
            <div className="pt-8 md:pt-12 border-t border-zinc-900/80">
               <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-zinc-700 mb-4 md:mb-8 flex items-center gap-2 md:gap-4">
                 <LinkIcon size={12} className="md:w-4 md:h-4 text-red-950" /> Sources Map
               </h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                 {result.sources.map((s, i) => (
                   <a key={i} href={s.uri} target="_blank" className="p-4 md:p-6 bg-[#08080a] border border-zinc-900 hover:border-red-800/40 rounded-xl md:rounded-[2rem] transition-all flex items-center gap-3 md:gap-5 group shadow-lg">
                      <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-700 group-hover:text-red-700 transition-all border border-zinc-900 group-hover:border-red-900/50">
                        <Globe size={20} className="md:w-7 md:h-7" />
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-[10px] md:text-[12px] font-black text-zinc-600 truncate uppercase tracking-tighter md:tracking-[0.15em] mb-0.5 group-hover:text-white transition-colors">{s.title}</p>
                        <p className="text-[8px] md:text-[10px] text-zinc-800 truncate font-mono group-hover:text-red-950 transition-colors">{s.uri}</p>
                      </div>
                   </a>
                 ))}
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResearchLab;