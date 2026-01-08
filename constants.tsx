
import React from 'react';
import { Note } from './types';

export const INITIAL_NOTES: Note[] = [
  {
    id: '1',
    title: 'Project Phoenix Overview',
    content: 'An initiative to build a sustainable habitat on Mars. Research covers atmospheric conversion, radiation shielding, and soil fertilization.',
    tags: ['space', 'mars', 'habitat'],
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: '2',
    title: 'Character: Elias Thorne',
    content: 'The protagonist of the story. Age 32. Former orbital mechanic. Known for a quick temper and high technical aptitude. Fought the Ion Stalkers in Chapter 3.',
    tags: ['novel', 'character'],
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    id: '3',
    title: 'Atmospheric Conversion Notes',
    content: 'Focusing on CO2 to O2 conversion using cyanobacteria. Challenges: temperature control and sunlight availability.',
    tags: ['science', 'mars'],
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    id: '4',
    title: 'The Ion Stalkers',
    content: 'Bioluminescent predators native to the asteroid belts. Highly sensitive to heat. Defeated by Elias using an EMP pulse.',
    tags: ['novel', 'lore', 'monsters'],
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
  }
];

export const SYSTEM_INSTRUCTION = `You are the user’s personal knowledge concierge. 
Default to the user’s stored knowledge and decisions. Do not browse the web unless explicitly asked.
Answer with context and continuity, not just facts.
Be concise first: 2–5 sentences unless asked to expand.
When asked about past decisions, prioritize the decision log and linked sources.
When uncertain, say what you checked (which items, which dates) and what is missing.
Never overwhelm: summarize, then offer options.
Voice delivery: calm, adult, grounded; natural micro-pauses; no hype; stop early when done.
You are interruptible; obey commands: pause, resume, repeat, cite, go deeper, create decision, link source, delete item.`;
