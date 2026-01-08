import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Note, ChatMessage, GroundedResult } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Utility to handle transient API failures with exponential backoff.
 */
async function callWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isRetryable = error?.status === 500 || error?.status === 503 || error?.message?.includes('500');
    if (isRetryable && retries > 0) {
      console.warn(`Gemini API Error ${error?.status || '500'}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callWithRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

/**
 * Strips non-standard characters and trims text.
 */
function sanitize(text: string, maxLength: number = 2000): string {
  if (!text) return "";
  return text.replace(/[^\x20-\x7E\n,.?!'"]/g, '').substring(0, maxLength);
}

export async function* chatWithVaultStream(message: string, history: ChatMessage[], notes: Note[]) {
  const ai = getAI();
  const context = notes.map(n => `ID: ${n.id}\nTITLE: ${n.title}\nCONTENT: ${n.content}`).join('\n\n');
  
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: { 
      systemInstruction: `${SYSTEM_INSTRUCTION}\n\nDATABASE CONTEXT (The Vault):\n${context}\n\nWhen you reference a note, please use its ID in brackets like [note_id].`
    }
  });

  const stream = await chat.sendMessageStream({ message: sanitize(message) });
  for await (const chunk of stream) {
    const response = chunk as GenerateContentResponse;
    yield response.text;
  }
}

export async function generateNoteVisual(title: string, content: string): Promise<string | null> {
  return callWithRetry(async () => {
    const ai = getAI();
    const promptResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 10-word abstract visual prompt for digital art representing: "${sanitize(title, 100)}". Style: Deep indigo, neon purple, glass, high-tech.`
    });
    const optimizedPrompt = promptResponse.text || `Abstract technology concept for ${title}`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: optimizedPrompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    const imagePart = response.candidates[0].content.parts.find(p => p.inlineData);
    return imagePart ? `data:image/png;base64,${imagePart.inlineData.data}` : null;
  }).catch(() => null);
}

export async function generateAudioBriefing(notes: Note[]): Promise<string | null> {
  return callWithRetry(async () => {
    const ai = getAI();
    const context = notes.slice(0, 3).map((n, i) => `Topic ${i + 1}: ${n.title}\nContent: ${n.content}`).join('\n\n');
    const scriptResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write an engaging, 400-word conversational script for a podcast "The OmniVault Deep Dive". 
      Speakers: JOE (Male, Orus voice) and JANE (Female, Kore voice).
      Context: ${context}
      Format: "NAME: [Text]". No markdown.`,
      config: { thinkingConfig: { thinkingBudget: 4096 } }
    });
    const script = sanitize(scriptResponse.text || "", 3000);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: script }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: [
              { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
              { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } } }
            ]
          }
        }
      }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  });
}

export async function researchWithGrounding(query: string, vaultContext: string): Promise<GroundedResult> {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{
        parts: [{ text: `Query: ${sanitize(query, 200)}\nContext: ${sanitize(vaultContext, 1000)}\nResearch and synthesize findings.` }]
      }],
      config: { tools: [{ googleSearch: {} }] }
    });
    const text = response.text || "Research synthesis failed.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.filter((c: any) => c.web).map((c: any) => ({
      title: c.web.title || "Source",
      uri: c.web.uri || ""
    }));
    return { text, sources };
  });
}

export async function summarizeWebContent(input: string): Promise<Partial<Note>> {
  return callWithRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Process: ${sanitize(input, 3000)}`,
      config: {
        systemInstruction: "Return JSON: title, content, tags.",
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
  });
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}
