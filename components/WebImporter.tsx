
import React, { useState, useEffect } from 'react';
import { Share2, Link as LinkIcon, Wand2, ArrowRight, Check } from 'lucide-react';
import { summarizeWebContent } from '../services/geminiService';
import { Note } from '../types';

interface Props {
  onAdd: (note: Partial<Note>) => void;
}

const WebImporter: React.FC<Props> = ({ onAdd }) => {
  const [input, setInput] = useState(() => localStorage.getItem('omnivault_importer_draft') || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    localStorage.setItem('omnivault_importer_draft', input);
  }, [input]);

  const handleImport = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    try {
      const noteData = await summarizeWebContent(input);
      onAdd({ ...noteData, sourceUrl: input.includes('http') ? input : undefined });
      setInput('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <Share2 className="text-blue-400" />
          Smart Importer
        </h2>
        <p className="text-zinc-500 text-sm">Paste a URL or any text to instantly convert it into a structured Vault note.</p>
      </header>

      <div className="bg-[#16161a] border border-blue-500/20 rounded-2xl p-6">
        <div className="space-y-4">
          <div className="relative">
            <LinkIcon className="absolute left-4 top-4 text-zinc-500" size={20} />
            <textarea 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Paste URL or copied website text here..." 
              className="w-full bg-[#0d0d0f] border border-[#27272a] rounded-xl py-4 pl-12 pr-4 min-h-[150px] outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-white placeholder:text-zinc-700"
            />
          </div>
          
          <button 
            onClick={handleImport}
            disabled={isProcessing || !input.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-95"
          >
            {isProcessing ? (
              <>
                <Wand2 className="animate-spin" size={20} />
                Synthesizing Concept...
              </>
            ) : success ? (
              <>
                <Check size={20} />
                Added to Vault
              </>
            ) : (
              <>
                Process and Import <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 bg-zinc-900/40 rounded-2xl border border-dashed border-zinc-800 text-center">
        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-widest leading-relaxed">
          OmniVault extracts titles, tags, and core summaries automatically.<br/>
          Draft is saved locally as you type.
        </p>
      </div>
    </div>
  );
};

export default WebImporter;
