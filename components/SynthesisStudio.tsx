import React, { useState, useRef, useEffect } from 'react';
import { Note } from '../types';
import { Headphones, Play, Pause, Sparkles, RefreshCw, Volume2, Wand2, Download, History, BrainCircuit, AlertTriangle, ChevronRight, Square } from 'lucide-react';
import { generateAudioBriefing, decode } from '../services/geminiService';

interface Props {
  notes: Note[];
}

const SynthesisStudio: React.FC<Props> = ({ notes }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const pcmToWav = (pcmData: Uint8Array, sampleRate: number = 24000) => {
    const buffer = new ArrayBuffer(44 + pcmData.length);
    const view = new DataView(buffer);
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
    };
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); 
    view.setUint16(22, 1, true); 
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); 
    view.setUint16(32, 2, true); 
    view.setUint16(34, 16, true); 
    writeString(36, 'data');
    view.setUint32(40, pcmData.length, true);
    new Uint8Array(buffer, 44).set(pcmData);
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const handleGenerate = async () => {
    if (notes.length === 0) {
      setError("The Vault must contain entries before a synthesis can occur.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setAudioUrl(null);
    setStatusMessage('Syncing Neural Script...');
    try {
      const base64Audio = await generateAudioBriefing(notes.slice(0, 3));
      if (base64Audio) {
        setStatusMessage('Reconstructing Waves...');
        const raw = decode(base64Audio);
        const blob = pcmToWav(raw);
        setAudioUrl(URL.createObjectURL(blob));
        setStatusMessage('Synthesis complete.');
      }
    } catch (err) {
      setError("Production core failure. Retry advised.");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
  };

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      const onEnded = () => setIsPlaying(false);
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      audio.addEventListener('ended', onEnded);
      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('timeupdate', () => setProgress((audio.currentTime / audio.duration) * 100));
      return () => {
        audio.removeEventListener('ended', onEnded);
        audio.removeEventListener('play', onPlay);
        audio.removeEventListener('pause', onPause);
      };
    }
  }, [audioUrl]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-32">
      <header className="flex flex-col gap-2">
        <h2 className="text-4xl font-black flex items-center gap-4 text-white">
          <div className="bg-red-900/20 p-4 rounded-3xl border border-red-900/30">
            <Headphones className="text-red-600" size={32} />
          </div>
          Synthesis Studio
        </h2>
        <p className="text-zinc-500 text-sm max-w-lg font-medium">Generate information-dense audio briefings via deep-red neural vocalization.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[#0f0f12] border border-red-950/30 rounded-[3rem] p-16 relative overflow-hidden group shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:text-red-600 transition-colors">
              <Sparkles size={260} />
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-10">
              <div className={`w-40 h-40 rounded-full flex items-center justify-center border-4 transition-all duration-1000 ${
                isGenerating ? 'border-red-600 animate-spin border-t-transparent' : 'border-zinc-800'
              }`}>
                <div className={`w-32 h-32 rounded-full flex items-center justify-center ${
                  isGenerating ? 'bg-red-900/10' : 'bg-zinc-900 shadow-inner'
                }`}>
                  <Volume2 size={48} className={isGenerating ? 'text-red-500' : 'text-zinc-800'} />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tight text-white">{isGenerating ? 'SYNTHESIZING...' : audioUrl ? 'BRIEFING READY' : 'PROTOCOL IDLE'}</h3>
                <p className="text-zinc-500 font-bold max-w-sm mx-auto uppercase text-[10px] tracking-[0.2em]">
                  {isGenerating ? statusMessage : audioUrl ? 'High-fidelity audio stream available.' : `Ready for ${notes.length} nodes analysis.`}
                </p>
              </div>

              {audioUrl ? (
                <div className="w-full max-w-md space-y-10">
                  <div className="relative h-2 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-900 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-8">
                    <button 
                      onClick={togglePlayback} 
                      className="w-24 h-24 bg-red-700 hover:bg-red-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-red-900/40 active:scale-95 transition-all"
                    >
                      {isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} className="ml-1" fill="white" />}
                    </button>
                    <button onClick={handleGenerate} className="p-6 bg-zinc-800 hover:bg-zinc-700 rounded-2xl text-zinc-400 transition-all">
                      <RefreshCw size={24} />
                    </button>
                  </div>
                  <audio ref={audioRef} src={audioUrl} />
                </div>
              ) : (
                <button onClick={handleGenerate} disabled={isGenerating || notes.length === 0} className="group bg-red-700 hover:bg-red-600 disabled:opacity-30 text-white px-16 py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-red-900/30 active:scale-95 transition-all flex items-center gap-4 uppercase tracking-widest">
                  <Wand2 size={24} /> {isGenerating ? 'Processing...' : 'Generate Briefing'}
                  <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0f0f12] border border-zinc-800/50 rounded-[2rem] p-10">
            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em] mb-8">Production Context</h4>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs font-bold uppercase">Nodes analyzed</span>
                <span className="font-mono text-white text-lg font-black">{Math.min(notes.length, 3)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-xs font-bold uppercase">Vocal Identity</span>
                <span className="bg-red-950/20 px-3 py-1 rounded text-[10px] text-red-500 font-black border border-red-900/30">ORICE/KORE V2</span>
              </div>
            </div>
          </div>
          <div className="bg-red-950/10 border border-red-600/20 rounded-[2rem] p-10">
             <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.4em] mb-4 flex items-center gap-2"><BrainCircuit size={14}/> Red Pipeline</h4>
             <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">Synthesis V2 utilizes the latest red-tier neural vocalization protocols for maximum semantic density.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SynthesisStudio;