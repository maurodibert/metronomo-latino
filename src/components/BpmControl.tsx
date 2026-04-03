interface Props {
  bpm: number;
  onChange: (bpm: number) => void;
}

export function BpmControl({ bpm, onChange }: Props) {
  return (
    <div className="bpm-control">
      <div className="bpm-display">
        <span className="bpm-number">{bpm}</span>
        <span className="bpm-label">BPM</span>
      </div>
      <div className="bpm-buttons">
        <button className="bpm-btn" onClick={() => onChange(Math.max(40, bpm - 5))}>−5</button>
        <button className="bpm-btn" onClick={() => onChange(Math.max(40, bpm - 1))}>−1</button>
        <input
          type="range"
          min={40}
          max={220}
          value={bpm}
          onChange={e => onChange(Number(e.target.value))}
          className="bpm-slider"
        />
        <button className="bpm-btn" onClick={() => onChange(Math.min(220, bpm + 1))}>+1</button>
        <button className="bpm-btn" onClick={() => onChange(Math.min(220, bpm + 5))}>+5</button>
      </div>
    </div>
  );
}
