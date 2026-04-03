import type { PercussionPattern } from '../engine/patterns';

interface Props {
  pattern: PercussionPattern;
  active: boolean;
  currentStep: number;
  onToggle: () => void;
}

export function PercussionToggle({ pattern, active, currentStep, onToggle }: Props) {
  const isHit = active && pattern.steps[currentStep];

  return (
    <button
      className={`percussion-btn ${active ? 'active' : ''} ${isHit ? 'hit' : ''}`}
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
  );
}
