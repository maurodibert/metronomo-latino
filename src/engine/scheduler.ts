// Scheduler de metrónomo con lookahead para timing preciso
// Basado en la técnica de Chris Wilson (Web Audio scheduling)

import { triggerPercussion } from './synthesis';
import type { PercussionPattern } from './patterns';

const LOOKAHEAD_MS = 25;       // cuánto mira hacia adelante el scheduler (ms)
const SCHEDULE_AHEAD_S = 0.1;  // cuánto programa por adelantado (segundos)

export interface SchedulerState {
  bpm: number;
  activePercussions: Set<string>;
  volumes: Record<string, number>;
  patterns: PercussionPattern[];
  onBeat: (step: number) => void;
  stepDuration: 'eighth' | 'sixteenth'; // 'eighth'=corchea (30/bpm), 'sixteenth'=semicorchea (15/bpm)
}

export class MetronomeScheduler {
  private ctx: AudioContext | null = null;
  private timerID: ReturnType<typeof setTimeout> | null = null;
  private currentStep = 0;
  private nextNoteTime = 0;
  private state: SchedulerState;

  constructor(state: SchedulerState) {
    this.state = state;
  }

  updateState(partial: Partial<SchedulerState>) {
    this.state = { ...this.state, ...partial };
  }

  get isRunning() {
    return this.timerID !== null;
  }

  async start() {
    if (this.isRunning) return;
    this.ctx = new AudioContext();
    // iOS/Safari suspende el contexto hasta que se reanuda explícitamente
    // dentro de un gesto del usuario
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.currentStep = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.schedule();
  }

  stop() {
    if (this.timerID !== null) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
    this.ctx?.close();
    this.ctx = null;
    this.currentStep = 0;
  }

  private secondsPerStep(): number {
    // 'eighth'    → corchea    = 30/bpm  (16 pasos = 2 compases de 4/4)
    // 'sixteenth' → semicorchea = 15/bpm (16 pasos = 1 compás  de 4/4)
    const multiplier = this.state.stepDuration === 'sixteenth' ? 15 : 30;
    return multiplier / this.state.bpm;
  }

  private schedule() {
    if (!this.ctx) return;

    while (
      this.nextNoteTime <
      this.ctx.currentTime + SCHEDULE_AHEAD_S
    ) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      this.state.onBeat(this.currentStep);
      this.nextNoteTime += this.secondsPerStep();
      this.currentStep = (this.currentStep + 1) % 16;
    }

    this.timerID = setTimeout(() => this.schedule(), LOOKAHEAD_MS);
  }

  private scheduleStep(step: number, time: number) {
    if (!this.ctx) return;

    for (const pattern of this.state.patterns) {
      if (
        pattern.steps[step] &&
        this.state.activePercussions.has(pattern.id)
      ) {
        const vol = this.state.volumes[pattern.id] ?? 1.0;
        triggerPercussion(this.ctx, pattern.synthType, time, vol, step);
      }
    }
  }
}
