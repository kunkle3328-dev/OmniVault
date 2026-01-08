
import React, { useMemo } from 'react';
import { Note } from '../types';
import { Share2, Link as LinkIcon, ArrowRight, Zap } from 'lucide-react';

interface Props {
  notes: Note[];
  onSelect: (note: Note) => void;
}

const GraphView: React.FC<Props> = ({ notes, onSelect }) => {
  // Helper to calculate a basic similarity score based on tags and content overlap
  const getRelatedNotes = (activeNote: Note, allNotes: Note[]) => {
    return allNotes
      .filter(n => n.id !== activeNote.id)
      .map(n => {
        let score = 0;
        // Shared tags are strong signals
        const sharedTags = n.tags.filter(tag => activeNote.tags.includes(tag));
        score += sharedTags.length * 2;

        // Title keyword overlap
        const activeTitleWords = activeNote.title.toLowerCase().split(/\s+/);
        const targetTitleWords = n.title.toLowerCase().split(/\s+/);
        const sharedTitleWords = activeTitleWords.filter(w => w.length > 3 && targetTitleWords.includes(w));
        score += sharedTitleWords.length * 1.5;

        // Content heuristic (simplified)
        if (n.content.toLowerCase().includes(activeNote.title.toLowerCase())) score += 1;

        return { note: n, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.note);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Share2 className="text-purple-500" />
            Knowledge Graph
          </h2>
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <Zap size={12} className="text-yellow-500" />
            Connections generated via semantic tag & keyword mapping
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">
          {notes.length} NODES
        </div>
      </header>

      <div className="grid gap-4">
        {notes.map(note => {
          const related = getRelatedNotes(note, notes);
          return (
            <div key={note.id} className="bg-[#16161a] border border-[#27272a] rounded-2xl p-5 hover:border-purple-500/30 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg text-white group-hover:text-purple-400 transition-colors">{note.title}</h3>
                  <div className="flex gap-2 mt-1">
                    {note.tags.map(t => (
                      <span key={t} className="text-[9px] uppercase tracking-widest text-zinc-600">#{t}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => onSelect(note)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold flex items-center gap-2">
                  <LinkIcon size={10} />
                  Semantic Connections
                </p>
                <div className="flex flex-wrap gap-2">
                  {related.length > 0 ? (
                    related.map(rel => (
                      <button 
                        key={rel.id}
                        onClick={() => onSelect(rel)}
                        className="flex items-center gap-2 bg-[#0d0d0f] border border-purple-500/10 px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-purple-300 hover:border-purple-500/40 transition-all"
                      >
                        {rel.title}
                      </button>
                    ))
                  ) : (
                    <span className="text-[11px] text-zinc-700 italic">No strong connections identified yet...</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GraphView;
