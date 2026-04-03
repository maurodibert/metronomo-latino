import { useEffect, useRef, useState } from 'react';
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

const LONG_PRESS_MS = 380;
const DRAG_RANGE_PX = 180;

export function PercussionToggle({ pattern, active, currentStep, volume, onToggle, onVolumeChange }: Props) {
  const isHit = active && pattern.steps[currentStep];
  const [volumeMode, setVolumeMode] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const startVolume = useRef(volume);
  const didLongPress = useRef(false);
  const volumeModeRef = useRef(false);

  useEffect(() => { volumeModeRef.current = volumeMode; }, [volumeMode]);

  // Listener nativo passive:false — necesario para preventDefault durante drag de volumen
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);

      if (volumeModeRef.current) {
        e.preventDefault();
        const newValue = Math.min(1, Math.max(0, startVolume.current + dx / DRAG_RANGE_PX));
        onVolumeChange(newValue);
      } else if (Math.abs(dx) > 8 || dy > 8) {
        if (timerRef.current) clearTimeout(timerRef.current);
      }
    };

    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, [onVolumeChange]);

  const cancelTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const handleRowTouchStart = (e: React.TouchEvent) => {
    didLongPress.current = false;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    startVolume.current = volume;
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      setVolumeMode(true);
    }, LONG_PRESS_MS);
  };

  const handleRowTouchEnd = (e: React.TouchEvent) => {
    cancelTimer();
    // El row ya NO hace toggle — eso es responsabilidad del checkbox
    e.preventDefault();
    setVolumeMode(false);
    didLongPress.current = false;
    touchStart.current = null;
  };

  const handleRowTouchCancel = () => {
    cancelTimer();
    setVolumeMode(false);
    didLongPress.current = false;
    touchStart.current = null;
  };

  const volPercent = Math.round(volume * 100);

  return (
    <div
      ref={rowRef}
      className={`percussion-row ${active ? 'active' : ''} ${isHit ? 'hit' : ''} ${volumeMode ? 'volume-mode' : ''}`}
      onTouchStart={handleRowTouchStart}
      onTouchEnd={handleRowTouchEnd}
      onTouchCancel={handleRowTouchCancel}
      onContextMenu={e => e.preventDefault()}
    >
      {/* Checkbox — única responsable del toggle */}
      <div
        className={`percussion-checkbox ${active ? 'checked' : ''}`}
        role="checkbox"
        aria-checked={active}
        onClick={onToggle}
        onTouchStart={e => e.stopPropagation()}
        onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onToggle(); }}
      />

      <div className="percussion-toggle-btn">
        <span className="percussion-label">{pattern.label}</span>
        <div className="step-grid">
          {pattern.steps.map((on, i) => (
            <div
              key={i}
              className={`step ${on ? 'step-on' : ''} ${i === currentStep && active ? 'step-current' : ''} ${i % 4 === 0 && i !== 0 ? 'step-beat-start' : ''}`}
            />
          ))}
        </div>
      </div>

      {volumeMode
        ? <span className="vol-label">{volPercent}%</span>
        : <Knob value={volume} onChange={onVolumeChange} />
      }
    </div>
  );
}
