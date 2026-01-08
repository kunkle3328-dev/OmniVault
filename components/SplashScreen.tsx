
import React, { useEffect, useState } from 'react';
import { Brain, Zap, Shield, Sparkles } from 'lucide-react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1.5;
      });
    }, 30);

    const stages = [
      { delay: 800, text: 'INITIALIZING VAULT PROTOCOLS...' },
      { delay: 1800, text: 'SYNCING KNOWLEDGE GRAPH...' },
      { delay: 2800, text: 'OPTIMIZING SEMANTIC NEURONS...' },
      { delay: 3800, text: 'SECURE CONCIERGE HANDSHAKE...' },
    ];

    stages.forEach((s, i) => {
      setTimeout(() => setStage(i), s.delay);
    });

    setTimeout(onComplete, 4500);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[1000] bg-[#0a0a0c] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* The Omni-Core Logo */}
      <div className="relative mb-12 animate-in zoom-in-50 duration-1000">
        <div className="absolute inset-0 bg-purple-600 blur-[60px] opacity-20 animate-pulse" />
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            <defs>
              <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#9333ea' }} />
                <stop offset="100%" style={{ stopColor: '#4f46e5' }} />
              </linearGradient>
            </defs>
            {/* Hexagonal Vault Structure */}
            <path 
              d="M50 5 L85 25 L85 75 L50 95 L15 75 L15 25 Z" 
              fill="none" 
              stroke="url(#coreGrad)" 
              strokeWidth="1" 
              className="animate-[spin_10s_linear_infinite]"
            />
            {/* Inner Core Pulsar */}
            <circle cx="50" cy="50" r="12" fill="url(#coreGrad)" className="animate-pulse" />
            {/* Connection Nodes */}
            {[0, 60, 120, 180, 240, 300].map((angle, i) => (
              <circle 
                key={i} 
                cx={50 + 35 * Math.cos((angle * Math.PI) / 180)} 
                cy={50 + 35 * Math.sin((angle * Math.PI) / 180)} 
                r="1.5" 
                fill="#a855f7" 
                className="animate-ping"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </svg>
          <span className="absolute text-3xl font-black text-white pointer-events-none">Ω</span>
        </div>
      </div>

      {/* Progress & Text */}
      <div className="relative w-64 space-y-4">
        <div className="flex justify-between text-[10px] font-mono tracking-[0.2em] text-zinc-500 uppercase">
          <span className="animate-pulse">
            {['BOOT', 'SYNC', 'LOAD', 'SYNC'][stage]}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        
        {/* Futuristic Loader */}
        <div className="h-[2px] w-full bg-zinc-900 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(168,85,247,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="h-4 overflow-hidden">
          <p className="text-[10px] font-mono text-center text-purple-400/80 tracking-widest animate-in slide-in-from-bottom-2">
            {[
              'INITIALIZING VAULT PROTOCOLS...',
              'SYNCING KNOWLEDGE GRAPH...',
              'OPTIMIZING SEMANTIC NEURONS...',
              'SECURE CONCIERGE HANDSHAKE...'
            ][stage]}
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-12 flex flex-col items-center gap-1 opacity-40">
        <div className="flex items-center gap-2 text-xs font-bold tracking-[0.3em] uppercase">
          <Shield size={12} className="text-purple-500" />
          OmniVault AI
        </div>
        <span className="text-[8px] font-mono text-zinc-600">ENCRYPTION: AES-256 SEMANTIC HUB</span>
      </div>
    </div>
  );
};

export default SplashScreen;
