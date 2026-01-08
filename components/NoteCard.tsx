import React from 'react';
import { Note } from '../types';
import { Clock, Image as ImageIcon } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  return (
    <div 
      onClick={() => onClick(note)}
      className="group bg-[#0f0f12] border border-zinc-800/80 rounded-[2rem] overflow-hidden hover:border-red-600/50 transition-all cursor-pointer relative shadow-xl hover:shadow-red-900/5"
    >
      <div className="h-28 w-full bg-[#08080a] relative overflow-hidden">
        {note.imageUrl ? (
          <img src={note.imageUrl} alt={note.title} className="w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity duration-700 scale-105 group-hover:scale-100" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-900">
            <ImageIcon size={40} strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f12] to-transparent" />
      </div>

      <div className="p-7 pt-0 relative -mt-10">
        <h3 className="text-xl font-black text-white mb-3 group-hover:text-red-500 transition-colors line-clamp-1 tracking-tight">
          {note.title}
        </h3>
        
        <p className="text-xs text-zinc-500 line-clamp-2 mb-6 leading-relaxed font-medium">
          {note.content}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">
            <Clock size={12} />
            {new Date(note.updatedAt).toLocaleDateString()}
          </div>
          <div className="flex gap-1.5">
            {note.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[8px] font-black bg-red-950/30 text-red-500 border border-red-900/30 px-2 py-1 rounded-lg uppercase tracking-widest">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;