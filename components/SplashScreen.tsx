import React, { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 2));
    }, 40);
    const stages = [800, 1800, 2800, 3800];
    stages.forEach((d, i) => setTimeout(() => setStage(i), d));
    setTimeout(onComplete, 4500);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#060608] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.1)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="relative mb-16 animate-in zoom-in-50 duration-1000">
        <div className="absolute inset-0 bg-red-600 blur-[80px] opacity-10 animate-pulse" />
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]">
            <path d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z" fill="none" stroke="#dc2626" strokeWidth="2" className="animate-[spin_12s_linear_infinite]" />
            <circle cx="50" cy="50" r="14" fill="#dc2626" className="animate-pulse" />
            {[0, 60, 120, 180, 240, 300].map((a, i) => (
              <circle key={i} cx={50 + 38 * Math.cos((a * Math.PI) / 180)} cy={50 + 38 * Math.sin((a * Math.PI) / 180)} r="2" fill="#ef4444" className="animate-ping" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </svg>
          <span className="absolute text-4xl font-black text-white pointer-events-none tracking-tighter">Ω</span>
        </div>
      </div>

      <div className="relative w-72 space-y-6">
        <div className="flex justify-between text-[10px] font-black tracking-[0.4em] text-zinc-700 uppercase">
          <span className="animate-pulse text-red-900">BOOT_PROTOCOL</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden">
          <div className="h-full bg-red-600 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(220,38,38,0.5)]" style={{ width: `${progress}%` }} />
        </div>
        <div className="h-4 overflow-hidden">
          <p className="text-[10px] font-black text-center text-red-600/60 tracking-[0.3em] uppercase animate-in slide-in-from-bottom-2">
            {[
              'INITIALIZING RED CORES...',
              'SYNCING NEURAL GRAPH...',
              'OPTIMIZING VAULT V2...',
              'ESTABLISHING COMMAND LINK...'
            ][stage]}
          </p>
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-2 opacity-50">
        <div className="flex items-center gap-3 text-xs font-black tracking-[0.5em] uppercase text-white">
          <Shield size={16} className="text-red-600" />
          OMNIVAULT V2.0
        </div>
        <span className="text-[9px] font-mono text-zinc-600 font-bold uppercase tracking-widest">ENCRYPTION: RED-TIER ALPHA</span>
      </div>
    </div>
  );
};

export default SplashScreen;