// Grilla de 16 pasos = 2 compases de 4/4 en corcheas
// La clave de salsa es el patrón base de 2 compases (8 tiempos / 16 corcheas)
// Cada índice representa una corchea: 0=tiempo1, 1=tiempo1+, 2=tiempo2, etc.

export type PercussionId =
  | 'beat'
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
  synthType: 'beat' | 'click' | 'conga' | 'bongo' | 'rimshot' | 'scrape' | 'bell';
}

// Son Clave estándar — 5 golpes sobre 2 compases en corcheas (16 pasos)
// Cada paso = 1 corchea: 0=t1, 1=t1+, 2=t2, 3=t2+, 4=t3, 5=t3+, 6=t4, 7=t4+ (por compás)
//
// 3-2: 3 golpes en compás 1, 2 golpes en compás 2
//   Compás 1: t1(0), t2+(3), t4(6)
//   Compás 2: t3(12), t4(14)
//   Pasos: [0, 3, 6, 12, 14]
//   Grilla: [X . . X][. . X .][. . . .][X . X .]
//
// 2-3: 2 golpes en compás 1, 3 golpes en compás 2 (= 3-2 empezando en compás 2)
//   Compás 1: t3(4), t4(6)
//   Compás 2: t1(8), t2+(11), t4(14)
//   Pasos: [4, 6, 8, 11, 14]
//   Grilla: [. . . .][X . X .][X . . X][. . X .]
export function getClavePattern(type: ClaveType): boolean[] {
  const steps = Array(16).fill(false);
  if (type === '3-2') {
    [0, 3, 6, 12, 14].forEach(i => (steps[i] = true));
  } else {
    [4, 6, 8, 11, 14].forEach(i => (steps[i] = true));
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

// Beat (tierra) — pulso en cada tiempo (t1, t2, t3, t4) de cada compás
// t1 acento fuerte (steps 0, 8), resto suave
const beatSteps: boolean[] = (() => {
  const s = Array(16).fill(false);
  [0, 2, 4, 6, 8, 10, 12, 14].forEach(i => (s[i] = true));
  return s;
})();

export const DEFAULT_PATTERNS: Omit<PercussionPattern, 'steps'>[] = [
  { id: 'beat', label: 'Beat', synthType: 'beat' },
  { id: 'clave', label: 'Clave', synthType: 'click' },
  { id: 'conga', label: 'Conga', synthType: 'conga' },
  { id: 'bongo', label: 'Bongó', synthType: 'bongo' },
  { id: 'timbal', label: 'Timbal', synthType: 'rimshot' },
  { id: 'guiro', label: 'Güiro', synthType: 'scrape' },
  { id: 'campana', label: 'Campana', synthType: 'bell' },
];

export function buildPatterns(claveType: ClaveType): PercussionPattern[] {
  const stepsMap: Record<PercussionId, boolean[]> = {
    beat: beatSteps,
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
