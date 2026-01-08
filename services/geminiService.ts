
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Note, ChatMessage, GroundedResult } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function researchWithGrounding(query: string, vaultContext: string): Promise<GroundedResult> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Vault Context:\n${vaultContext}\n\nResearch Query: ${query}`,
    config: {
      systemInstruction: "You are an advanced research agent. Use Google Search to find latest info. Synthesize how this info relates to the user's current vault. Provide a structured report.",
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "No findings found.";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || "Source",
    uri: chunk.web?.uri || ""
  })) || [];

  return { text, sources };
}

export async function summarizeWebContent(input: string): Promise<Partial<Note>> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Content to process:\n${input}`,
    config: {
      systemInstruction: "Extract the core knowledge from this content. Create a concise title, a summary for the note body, and relevant tags. Return as JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "content", "tags"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function performSmartLookup(query: string, notes: Note[]): Promise<{ notes: Note[], summary: string }> {
  const ai = getAI();
  const context = notes.map(n => `ID: ${n.id}\nTitle: ${n.title}\nContent: ${n.content}`).join('\n---\n');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Query: ${query}\n\nNotes Context:\n${context}`,
    config: {
      systemInstruction: "You are a semantic search engine. Identify relevant notes. Summarize findings. Return relevant note IDs.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          relevantIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "relevantIds"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text || '{}');
    const matchedNotes = notes
      .filter(n => result.relevantIds.includes(n.id))
      .map(n => ({ ...n, relevanceScore: 0.95 }));
    
    return { notes: matchedNotes, summary: result.summary };
  } catch (e) {
    return { notes: [], summary: "Search failed." };
  }
}

export async function chatWithVault(message: string, history: ChatMessage[], notes: Note[]) {
  const ai = getAI();
  const context = notes.map(n => `Note: ${n.title}\nContent: ${n.content}`).join('\n\n');
  
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\nAvailable Knowledge Vault:\n${context}`,
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
