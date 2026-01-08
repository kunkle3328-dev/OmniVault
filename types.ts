
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: number;
  relevanceScore?: number;
  connections?: string[];
  sourceUrl?: string;
  imageUrl?: string; // AI generated visual representation
}

export interface AudioSession {
  id: string;
  title: string;
  timestamp: number;
  audioBlob?: Blob;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  linkedNoteIds?: string[];
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  VAULT = 'VAULT',
  COPILOT = 'COPILOT',
  GRAPH = 'GRAPH',
  SMART_LOOKUP = 'SMART_LOOKUP',
  RESEARCH_LAB = 'RESEARCH_LAB',
  WEB_IMPORT = 'WEB_IMPORT',
  STUDIO = 'STUDIO' // New Synthesis Studio view
}

export interface Decision {
  id: string;
  topic: string;
  outcome: string;
  timestamp: number;
  linkedNotes: string[];
}

export interface GroundedResult {
  text: string;
  sources: { title: string, uri: string }[];
}
