import { Knob } from './Knob';
import type { PercussionPattern } from '../engine/patterns';

interface Props {
  pattern: PercussionPattern;
  active: boolean;
  currentStep: number;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (v: number) => void;
}

export function PercussionToggle({ pattern, active, currentStep, volume, onToggle, onVolumeChange }: Props) {
  const isHit = active && pattern.steps[currentStep];

  return (
    <div className={`percussion-row ${active ? 'active' : ''} ${isHit ? 'hit' : ''}`}>
      <button
        className="percussion-toggle-btn"
        onClick={onToggle}
        aria-pressed={active}
      >
        <span className="percussion-label">{pattern.label}</span>
        <div className="step-grid">
          {pattern.steps.map((on, i) => (
            <div
              key={i}
              className={`step ${on ? 'step-on' : ''} ${i === currentStep && active ? 'step-current' : ''} ${i % 4 === 0 && i !== 0 ? 'step-beat-start' : ''}`}
            />
          ))}
        </div>
      </button>
      <Knob value={volume} onChange={onVolumeChange} />
    </div>
  );
}
