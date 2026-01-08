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
          startMic(sessionPromise);
        },
        onmessage: async (message) => {
          const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64 && audioContext.current) {
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
          mimeType: 'audio/pcm;rate=16000',
        };

        sessionPromise.then((session) => {
          session.sendRealtimeInput({ media: pcmBlob });
        });
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (err) {
      console.error("Mic error:", err);
      setIsActive(false);
    }
  };

  const stopSession = () => {
    sessionRef.current?.close();
    setIsActive(false);
  };

  return (
    <div className={`p-8 rounded-[2rem] border transition-all duration-700 flex items-center justify-between ${
      isActive ? 'bg-red-950/20 border-red-600/50 shadow-[0_0_50px_rgba(220,38,38,0.15)]' : 'bg-zinc-900/40 border-zinc-800'
    }`}>
      <div className="flex items-center gap-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
          isActive ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-zinc-800'
        }`}>
          {isActive ? <Volume2 className="text-white" size={28} /> : <Mic className="text-zinc-500" size={28} />}
        </div>
        <div>
          <h3 className={`font-black text-xl tracking-tight ${isActive ? 'text-red-500' : 'text-zinc-300'}`}>
            {isActive ? 'CONCIERGE LINK ACTIVE' : 'VOICE PROTOCOL'}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">
            {isActive ? 'Direct neural audio stream...' : 'Unencrypted vocal interface'}
          </p>
        </div>
      </div>
      
      <button 
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
          isActive ? 'bg-red-950/40 text-red-500 border border-red-900/40 hover:bg-red-900/20' : 'bg-red-700 text-white hover:bg-red-600 shadow-xl shadow-red-900/20'
        }`}
      >
        {isConnecting ? 'LINKING...' : isActive ? 'DISCONNECT' : 'INITIALIZE'}
      </button>
    </div>
  );
};

export default VoiceConcierge;