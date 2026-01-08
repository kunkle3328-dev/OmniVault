
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, Volume2 } from 'lucide-react';
import { decode, encode, decodeAudioData } from '../services/geminiService';
import { SYSTEM_INSTRUCTION } from '../constants';

interface Props {
  notesContext: string;
}

const VoiceConcierge: React.FC<Props> = ({ notesContext }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const audioContext = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTime = useRef(0);

  const startSession = async () => {
    setIsConnecting(true);
    // Correct initialization using named parameter and environment variable directly
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = audioContext.current.createGain();
    outputNode.connect(audioContext.current.destination);
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsActive(true);
          setIsConnecting(false);
          // Solely rely on sessionPromise resolves to send input to avoid race conditions
          startMic(sessionPromise);
        },
        onmessage: async (message) => {
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64 && audioContext.current) {
            // Schedule audio chunks precisely to ensure gapless playback
            nextStartTime.current = Math.max(nextStartTime.current, audioContext.current.currentTime);
            const raw = decode(audioBase64);
            const buffer = await decodeAudioData(raw, audioContext.current, 24000, 1);
            const source = audioContext.current.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNode);
            source.start(nextStartTime.current);
            nextStartTime.current = nextStartTime.current + buffer.duration;
          }
          
          if (message.serverContent?.interrupted) {
            // Reset timing on interruption
            nextStartTime.current = 0;
          }
        },
        onclose: () => setIsActive(false),
        onerror: () => setIsActive(false),
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\nVAULT CONTENT:\n${notesContext}`,
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const startMic = async (sessionPromise: Promise<any>) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const int16 = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
        
        const pcmBlob = {
          data: encode(new Uint8Array(int16.buffer)),
          // Using audio/pcm;rate=16000 as required for Live API
          mimeType: 'audio/pcm;rate=16000',
        };

        // CRITICAL: Always use the resolved session promise to send data
        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err) {
      console.error("Mic access denied or configuration error:", err);
      setIsActive(false);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    setIsActive(false);
  };

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-500 flex items-center justify-between ${
      isActive ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'bg-zinc-900/40 border-zinc-800'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isActive ? 'bg-purple-500 animate-pulse' : 'bg-zinc-800'
        }`}>
          {isActive ? <Volume2 className="text-white" /> : <Mic className="text-zinc-500" />}
        </div>
        <div>
          <h3 className="font-bold text-lg">{isActive ? 'Concierge Online' : 'Voice Interface'}</h3>
          <p className="text-xs text-zinc-500">{isActive ? 'Speaking with your Vault...' : 'Talk to your knowledge base'}</p>
        </div>
      </div>
      
      <button 
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`px-6 py-2 rounded-xl font-bold transition-all ${
          isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-purple-600 text-white hover:bg-purple-700'
        }`}
      >
        {isConnecting ? 'Connecting...' : isActive ? 'Disconnect' : 'Start Consultation'}
      </button>
    </div>
  );
};

export default VoiceConcierge;
