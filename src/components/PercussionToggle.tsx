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
const DRAG_RANGE_PX = 180; // px para recorrer el rango completo de volumen

export function PercussionToggle({ pattern, active, currentStep, volume, onToggle, onVolumeChange }: Props) {
  const isHit = active && pattern.steps[currentStep];
  const [volumeMode, setVolumeMode] = useState(false);

  const rowRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const startVolume = useRef(volume);
  const didLongPress = useRef(false);
  const volumeModeRef = useRef(false); // ref para el listener nativo

  // Sincronizar el ref con el estado
  useEffect(() => { volumeModeRef.current = volumeMode; }, [volumeMode]);

  // Listener nativo con passive:false para poder prevenir scroll durante drag de volumen
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = Math.abs(e.touches[0].clientY - touchStart.current.y);

      if (volumeModeRef.current) {
        e.preventDefault(); // evitar scroll mientras se arrastra el volumen
        const newValue = Math.min(1, Math.max(0, startVolume.current + dx / DRAG_RANGE_PX));
        onVolumeChange(newValue);
      } else {
        // Si el usuario se mueve antes del long press, cancelarlo
        if (Math.abs(dx) > 8 || dy > 8) {
          if (timerRef.current) clearTimeout(timerRef.current);
        }
      }
    };

    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, [onVolumeChange]);

  const handleTouchStart = (e: React.TouchEvent) => {
    didLongPress.current = false;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    startVolume.current = volume;

    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      setVolumeMode(true);
    }, LONG_PRESS_MS);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!didLongPress.current) {
      onToggle(); // tap corto = toggle
    }

    e.preventDefault(); // evita el click sintético que dispara el navegador tras touch
    setVolumeMode(false);
    didLongPress.current = false;
    touchStart.current = null;
  };

  const volPercent = Math.round(volume * 100);

  return (
    <div
      ref={rowRef}
      className={`percussion-row ${active ? 'active' : ''} ${isHit ? 'hit' : ''} ${volumeMode ? 'volume-mode' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onContextMenu={e => e.preventDefault()}
    >
      <button
        className="percussion-toggle-btn"
        onClick={e => {
          // En touch el toggle ya se maneja en handleTouchEnd;
          // aquí solo responder a clicks de mouse (desktop)
          if (e.detail !== 0) onToggle(); // detail===0 = evento sintético de touch
        }}
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

      {volumeMode
        ? <span className="vol-label">{volPercent}%</span>
        : <Knob value={volume} onChange={onVolumeChange} />
      }
    </div>
  );
}
