
import React from 'react';
import { Note } from '../types';
import { Tag, Clock } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  return (
    <div 
      onClick={() => onClick(note)}
      className="group bg-[#16161a] border border-[#27272a] rounded-xl p-5 hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {note.relevanceScore && (
          <div className="bg-purple-900/40 border border-purple-500/30 text-purple-300 text-[10px] px-2 py-1 rounded-full font-mono">
            Rel: {(note.relevanceScore * 100).toFixed(0)}%
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-[#f4f4f5] mb-2 group-hover:text-purple-400 transition-colors">
        {note.title}
      </h3>
      
      <p className="text-sm text-zinc-400 line-clamp-3 mb-4 leading-relaxed">
        {note.content}
      </p>
      
      <div className="flex flex-wrap items-center gap-3 mt-auto">
        <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-medium">
          <Clock size={12} />
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
        <div className="flex gap-2">
          {note.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
