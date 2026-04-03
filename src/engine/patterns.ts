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
// Son Clave — fuente: scphillips.com/dance/salsarhythm.html
// Grid de 16 pasos = 2 compases de 4/4 en corcheas
// Índices: 0=t1, 1=t1+, 2=t2, 3=t2+, 4=t3, 5=t3+, 6=t4, 7=t4+ (por compás)
//
// 3-2: [X . . X][. . X .][. . X .][X . . .]
//   Compás 1 (3 golpes): t1(0), t2+(3), t4(6)
//   Compás 2 (2 golpes): t2(10), t3(12)
//   Pasos: [0, 3, 6, 10, 12]
//
// 2-3: [. . X .][X . . .][X . . X][. . X .]
//   Compás 1 (2 golpes): t2(2), t3(4)
//   Compás 2 (3 golpes): t1(8), t2+(11), t4(14)
//   Pasos: [2, 4, 8, 11, 14]
export function getClavePattern(type: ClaveType): boolean[] {
  const steps = Array(16).fill(false);
  if (type === '3-2') {
    [0, 3, 6, 10, 12].forEach(i => (steps[i] = true));
  } else {
    [2, 4, 8, 11, 14].forEach(i => (steps[i] = true));
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

// Beat (tierra) — pulso en cada tiempo (1, 2, 3, 4) del ciclo de 2 compases
// Cada tiempo = 4 pasos en el grid → steps 0, 4, 8, 12
// t1 del ciclo (step 0) = acento fuerte; resto = suave
const beatSteps: boolean[] = (() => {
  const s = Array(16).fill(false);
  [0, 4, 8, 12].forEach(i => (s[i] = true));
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
