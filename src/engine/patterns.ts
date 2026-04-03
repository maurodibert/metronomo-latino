// Grilla de 16 pasos = 2 compases de 4/4 en corcheas
// La clave de salsa es el patrón base de 2 compases (8 tiempos / 16 corcheas)
// Cada índice representa una corchea: 0=tiempo1, 1=tiempo1+, 2=tiempo2, etc.

export type PercussionId =
  | 'clave'
  | 'conga'
  | 'bongo'
  | 'timbal'
  | 'guiro'
  | 'campana';

export type ClaveType = '2-3' | '3-2';

export interface PercussionPattern {
  id: PercussionId;
  label: string;
  steps: boolean[];
  // Para síntesis: tipo de sonido
  synthType: 'click' | 'conga' | 'bongo' | 'rimshot' | 'scrape' | 'bell';
}

// Clave 2-3: pasos 0, 3, 6, 10, 14
// Clave 3-2: pasos 0, 4, 8, 11, 14 (espejada)
export function getClavePattern(type: ClaveType): boolean[] {
  const steps = Array(16).fill(false);
  if (type === '2-3') {
    [0, 3, 6, 10, 14].forEach(i => (steps[i] = true));
  } else {
    [0, 4, 8, 11, 14].forEach(i => (steps[i] = true));
  }
  return steps;
}

// Tumbao de conga (patrón simplificado)
const congaSteps: boolean[] = (() => {
  const s = Array(16).fill(false);
  [2, 5, 7, 10, 12, 14].forEach(i => (s[i] = true));
  return s;
})();

// Bongó martillo (corcheas con acentos)
const bongoSteps: boolean[] = (() => {
  const s = Array(16).fill(false);
  [0, 2, 4, 5, 6, 8, 10, 12, 14].forEach(i => (s[i] = true));
  return s;
})();

// Timbal (shell/cáscara)
const timbalSteps: boolean[] = (() => {
  const s = Array(16).fill(false);
  [0, 2, 4, 6, 8, 10, 12, 14].forEach(i => (s[i] = true));
  return s;
})();

// Güiro (hacia adelante en 1 y 3, corto en 2 y 4)
const guiroSteps: boolean[] = (() => {
  const s = Array(16).fill(false);
  [0, 2, 4, 6, 8, 10, 12, 14].forEach(i => (s[i] = true));
  return s;
})();

// Campana (cencerro) — patrón mambo
const campanaSteps: boolean[] = (() => {
  const s = Array(16).fill(false);
  [0, 3, 6, 8, 11, 14].forEach(i => (s[i] = true));
  return s;
})();

export const DEFAULT_PATTERNS: Omit<PercussionPattern, 'steps'>[] = [
  { id: 'clave', label: 'Clave', synthType: 'click' },
  { id: 'conga', label: 'Conga', synthType: 'conga' },
  { id: 'bongo', label: 'Bongó', synthType: 'bongo' },
  { id: 'timbal', label: 'Timbal', synthType: 'rimshot' },
  { id: 'guiro', label: 'Güiro', synthType: 'scrape' },
  { id: 'campana', label: 'Campana', synthType: 'bell' },
];

export function buildPatterns(claveType: ClaveType): PercussionPattern[] {
  const stepsMap: Record<PercussionId, boolean[]> = {
    clave: getClavePattern(claveType),
    conga: congaSteps,
    bongo: bongoSteps,
    timbal: timbalSteps,
    guiro: guiroSteps,
    campana: campanaSteps,
  };

  return DEFAULT_PATTERNS.map(p => ({
    ...p,
    steps: stepsMap[p.id],
  }));
}
