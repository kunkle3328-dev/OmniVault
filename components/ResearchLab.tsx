
import React, { useState, useEffect } from 'react';
import { Microscope, Search, Link as LinkIcon, Download, Sparkles, Globe, FileText, Zap, Trash2 } from 'lucide-react';
import { researchWithGrounding } from '../services/geminiService';
import { GroundedResult, Note } from '../types';

interface Props {
  vaultContext: string;
  onImport: (noteData: Partial<Note>) => void;
}

const ResearchLab: React.FC<Props> = ({ vaultContext, onImport }) => {
  const [query, setQuery] = useState(() => localStorage.getItem('omnivault_last_research_query') || '');
  const [isResearching, setIsResearching] = useState(false);
  const [result, setResult] = useState<GroundedResult | null>(() => {
    const saved = localStorage.getItem('omnivault_last_research_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [loaderStep, setLoaderStep] = useState(0);

  const steps = [
    'Broadcasting Web Probe...',
    'Intercepting Semantic Data...',
    'Neutralizing Data Noise...',
    'Synthesizing Neural Graph...'
  ];

  // Persist research state
  useEffect(() => {
    localStorage.setItem('omnivault_last_research_query', query);
    if (result) {
      localStorage.setItem('omnivault_last_research_result', JSON.stringify(result));
    }
  }, [query, result]);

  useEffect(() => {
    let interval: any;
    if (isResearching) {
      interval = setInterval(() => {
        setLoaderStep((s) => (s + 1) % steps.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isResearching]);

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

  const clearResearch = () => {
    if (window.confirm("Abandon current research session?")) {
      setResult(null);
      setQuery('');
      localStorage.removeItem('omnivault_last_research_result');
      localStorage.removeItem('omnivault_last_research_query');
    }
  };

  const handleImportFullReport = () => {
    if (!result) return;
    onImport({
      title: `Research: ${query}`,
      content: result.text,
      tags: ['research', 'ai-synthesis'],
      updatedAt: Date.now()
    });
    // Optional: Clear after import
    // setResult(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Microscope className="text-emerald-400" />
            Research Lab
          </h2>
          {result && (
            <button onClick={clearResearch} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <p className="text-zinc-500 text-sm">Discover and synthesize new knowledge directly into your vault.</p>
      </header>

      <div className="bg-[#16161a] border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleResearch()}
              placeholder="Latest breakthroughs in AI memory..." 
              className="w-full bg-[#0d0d0f] border border-[#27272a] rounded-xl py-3.5 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white placeholder:text-zinc-700"
            />
          </div>
          <button 
            onClick={handleResearch}
            disabled={isResearching}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            {isResearching ? (
              <Zap className="animate-pulse" size={18} />
            ) : (
              <Search size={18} />
            )}
            {isResearching ? 'Analysing' : 'Research'}
          </button>
        </div>
      </div>

      {isResearching && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-emerald-500/10 rounded-full" />
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <Sparkles className="absolute inset-0 m-auto text-emerald-400 animate-pulse" size={32} />
          </div>
          <div className="text-center">
            <p className="text-emerald-400 font-mono text-[10px] tracking-[0.3em] uppercase mb-1">{steps[loaderStep]}</p>
            <p className="text-zinc-600 text-xs italic">Consulting global web and private vault...</p>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#16161a] border border-[#27272a] rounded-2xl p-6 leading-relaxed text-zinc-300 relative group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                <Sparkles size={14} />
                AI Intelligence Synthesis
              </div>
              <button 
                onClick={handleImportFullReport}
                className="flex items-center gap-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-[10px] px-4 py-2 rounded-lg border border-emerald-500/30 transition-all font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/5 active:scale-95"
              >
                <Download size={14} />
                Commit to Vault
              </button>
            </div>
            <div className="prose prose-invert max-w-none space-y-4">
              {result.text.split('\n').map((line, i) => (
                <p key={i} className="text-zinc-300 text-sm leading-relaxed">{line}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
               <Globe size={12} />
               Verifiable Sources
            </h3>
            <div className="grid gap-3">
              {result.sources.map((source, i) => (
                <div key={i} className="bg-[#0d0d0f] border border-[#27272a] p-4 rounded-xl flex items-center justify-between group hover:border-emerald-500/40 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-zinc-600 group-hover:text-emerald-400 transition-colors border border-zinc-800 group-hover:border-emerald-500/30">
                      <LinkIcon size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-zinc-200 line-clamp-1 text-sm">{source.title}</h4>
                      <p className="text-[10px] text-zinc-600 line-clamp-1 font-mono">{source.uri}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onImport({ 
                      title: source.title, 
                      content: `Source: ${source.uri}\n\nAbstracted from Research Lab session regarding: ${query}`, 
                      sourceUrl: source.uri,
                      tags: ['research-source']
                    })}
                    className="p-2 hover:bg-emerald-500/10 text-zinc-600 hover:text-emerald-400 rounded-lg transition-colors"
                  >
                    <Download size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchLab;
