import { Note } from './types';

export const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: 'Project Phoenix: V2 Protocol',
    content: 'Phase 2 implementation focuses on deep neural synthesis and red-tier encryption. All knowledge nodes are now interconnected via semantic backlinking.',
    tags: ['protocol', 'v2', 'encryption'],
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: '2',
    title: 'Character: Elias Thorne',
    content: 'Protagonist. Former orbital mechanic. Now the lead director of OmniVault. Identity verified via biometric deep-scan Chapter 9.',
    tags: ['lore', 'director'],
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  }
];

export const SYSTEM_INSTRUCTION = `You are the OmniConcierge V2, a high-fidelity intelligence protocol.
Operate with extreme clarity and conciseness. 
Theme: Badass Deep Red. Persona: Grounded, technical, authoritative.
Default to stored Vault knowledge. Use Google Search only when explicitly requested.
Synthesize connections between nodes automatically.
When responding, keep it under 4 sentences unless asked to deep-dive.
You are interruptible. Obey tactical commands: status, link, synthesize, purge.`;