// Configuraciones de géneros latinos para el metrónomo
// Cada género define sus instrumentos, patrones y parámetros de tempo
//
// stepDuration:
//   'eighth'    → 16 pasos = 2 compases de 4/4 en corcheas   (30/bpm segundos por paso)
//   'sixteenth' → 16 pasos = 1 compás  de 4/4 en semicorcheas (15/bpm segundos por paso)

import type { PercussionPattern, SynthType } from './patterns';

export type GenreId = 'salsa' | 'merengue' | 'bachata' | 'chachacha';
export type StepDuration = 'eighth' | 'sixteenth';

export interface GenreConfig {
  id: GenreId;
  name: string;
  description: string;
  emoji: string;
  tempoRange: [number, number];
  defaultBpm: number;
  stepDuration: StepDuration;
  instruments: PercussionPattern[];
  defaultActive: string[];
}

// Helper: crea un array de 16 booleanos con hits en las posiciones indicadas
function s(positions: number[]): boolean[] {
  const arr: boolean[] = Array(16).fill(false);
  positions.forEach(i => (arr[i] = true));
  return arr;
}

function instr(id: string, label: string, synthType: SynthType, positions: number[]): PercussionPattern {
  return { id, label, synthType, steps: s(positions) };
}

// ─────────────────────────────────────────────────────────────────────────────
// SALSA — definida aquí solo para la pantalla de selección
// Los patrones reales los maneja patterns.ts (por el selector de clave)
// ─────────────────────────────────────────────────────────────────────────────
const SALSA: GenreConfig = {
  id: 'salsa',
  name: 'Salsa',
  description: 'Afrocubano. Base: clave son 2-3 / 3-2.',
  emoji: '🎺',
  tempoRange: [160, 200],
  defaultBpm: 174,
  stepDuration: 'eighth',
  instruments: [], // gestionado por patterns.ts
  defaultActive: ['beat', 'clave', 'conga', 'timbal'],
};

// ─────────────────────────────────────────────────────────────────────────────
// MERENGUE — 16 pasos = 1 compás de semicorcheas (stepDuration: 'sixteenth')
// Fuente: patrones-ritmos-latinos.md, sección Merengue Derecho
//
// Mapa de posiciones (0-15 = semicorcheas del compás):
// 0=1, 1=1e, 2=1+, 3=1a, 4=2, 5=2e, 6=2+, 7=2a,
// 8=3, 9=3e, 10=3+, 11=3a, 12=4, 13=4e, 14=4+, 15=4a
// ─────────────────────────────────────────────────────────────────────────────
const MERENGUE: GenreConfig = {
  id: 'merengue',
  name: 'Merengue',
  description: 'Dominicano. Base: tambora y güira.',
  emoji: '🇩🇴',
  tempoRange: [120, 160],
  defaultBpm: 140,
  stepDuration: 'sixteenth',
  instruments: [
    // Beat: cada tiempo (1,2,3,4)
    instr('beat',     'Beat',    'beat',    [0, 4, 8, 12]),
    // Güira: D-D-d-D-D-d... (raspados fuertes en corcheas + débiles en contratiempos)
    // Simplificado a raspados en cada corchea y contratiempos seleccionados
    instr('guira',    'Güira',   'scrape',  [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15]),
    // Tambora: golpes en cada tiempo (O=open en 1,3 + S=slap en 2,4) + rim en corcheas
    instr('tambora',  'Tambora', 'conga',   [0, 2, 4, 6, 8, 10, 12, 14]),
    // Conga: tumbao (slap en + del 1 y 3, open en + del 2 y 4 — mismo patrón que salsa)
    instr('conga',    'Conga',   'conga',   [2, 6, 7, 10, 14, 15]),
    // Cencerro: cada corchea
    instr('cencerro', 'Cencerro','bell',    [0, 2, 4, 6, 8, 10, 12, 14]),
  ],
  defaultActive: ['beat', 'guira', 'tambora', 'cencerro'],
};

// ─────────────────────────────────────────────────────────────────────────────
// BACHATA — 16 pasos = 2 compases de corcheas (stepDuration: 'eighth')
// Patrón de 1 compás (8 corcheas) repetido 2 veces
// Fuente: patrones-ritmos-latinos.md, sección Bachata Derecho
//
// Mapa de posiciones (0-15 = corcheas de 2 compases):
// 0=1, 1=1+, 2=2, 3=2+, 4=3, 5=3+, 6=4, 7=4+ (compás 1)
// 8=1, 9=1+,10=2,11=2+,12=3,13=3+,14=4,15=4+  (compás 2)
// ─────────────────────────────────────────────────────────────────────────────
const BACHATA: GenreConfig = {
  id: 'bachata',
  name: 'Bachata',
  description: 'Dominicano. Firma: síncopa en el 2+.',
  emoji: '🌹',
  tempoRange: [120, 140],
  defaultBpm: 130,
  stepDuration: 'eighth',
  instruments: [
    // Beat: tiempos 1,2,3,4 de cada compás
    instr('beat',  'Beat',   'beat',   [0, 4, 8, 12]),
    // Bongó: cada corchea (H en tiempos, M en contratiempos alternados)
    instr('bongo', 'Bongó',  'bongo',  [0, 2, 4, 6, 8, 10, 12, 14]),
    // Güira: D-Uu patrón — down en tiempos, up fuerte + up suave en contratiempos
    instr('guira', 'Güira',  'scrape', [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15]),
    // Bajo: 1, 2+(síncopa bachata), 3, 4 — la firma rítmica del género
    instr('bajo',  'Bajo',   'beat',   [0, 3, 4, 6, 8, 11, 12, 14]),
  ],
  defaultActive: ['beat', 'bongo', 'guira', 'bajo'],
};

// ─────────────────────────────────────────────────────────────────────────────
// CHA-CHA-CHÁ — 16 pasos = 2 compases de corcheas (stepDuration: 'eighth')
// Base: clave son 2-3 adaptada al cha-cha (distinta de la salsa)
// Fuente: patrones-ritmos-latinos.md, sección Cha-cha-cha
//
// Clave cha-cha (en corcheas, 2 compases de 8 pasos):
// Compás 1: hits en beats 1 y 3 → pasos 0, 4
// Compás 2: hits en 2+, 3+, 4   → pasos 11, 13, 14
// ─────────────────────────────────────────────────────────────────────────────
const CHACHACHA: GenreConfig = {
  id: 'chachacha',
  name: 'Cha-cha-chá',
  description: 'Hijo del mambo. Clave son 2-3.',
  emoji: '💃',
  tempoRange: [100, 130],
  defaultBpm: 120,
  stepDuration: 'eighth',
  instruments: [
    // Beat
    instr('beat',    'Beat',    'beat',    [0, 4, 8, 12]),
    // Clave cha-cha (2-3): distinta de la salsa
    instr('clave',   'Clave',   'click',   [0, 4, 11, 13, 14]),
    // Güiro: L en tiempos, dos S cortos antes del siguiente tiempo (el "cha cha cha")
    instr('guiro',   'Güiro',   'scrape',  [0, 2, 3, 8, 10, 11]),
    // Campana: en cada corchea (X en tiempos, x en contratiempos)
    instr('campana', 'Campana', 'bell',    [0, 2, 4, 6, 8, 10, 12, 14]),
    // Timbal: tono cerrado en beat 2, tono abierto en beat 4 de cada compás
    instr('timbal',  'Timbal',  'rimshot', [2, 6, 10, 14]),
    // Conga: tumbao similar al de salsa
    instr('conga',   'Conga',   'conga',   [2, 6, 7, 10, 14, 15]),
  ],
  defaultActive: ['beat', 'clave', 'guiro', 'campana'],
};

// ─────────────────────────────────────────────────────────────────────────────
export const GENRES: GenreConfig[] = [SALSA, MERENGUE, BACHATA, CHACHACHA];

export function getGenre(id: GenreId): GenreConfig {
  return GENRES.find(g => g.id === id)!;
}
