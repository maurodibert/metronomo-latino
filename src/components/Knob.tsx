import { useCallback, useEffect, useRef } from 'react';

interface Props {
  value: number;        // 0 – 1
  onChange: (v: number) => void;
  size?: number;
}

// Rango visual: -135° (mín) a +135° (máx) = 270° total
const MIN_DEG = -135;
const MAX_DEG = 135;
// Píxeles de arrastre vertical para recorrer el rango completo
const DRAG_RANGE_PX = 160;

export function Knob({ value, onChange, size = 36 }: Props) {
  const startY = useRef<number | null>(null);
  const startValue = useRef(value);

  const deg = MIN_DEG + value * (MAX_DEG - MIN_DEG);

  // Coordenadas del indicador (punto sobre el borde)
  const r = size / 2;
  const indicatorR = r - 4;
  const rad = (deg - 90) * (Math.PI / 180);
  const ix = r + indicatorR * Math.cos(rad);
  const iy = r + indicatorR * Math.sin(rad);

  const onMove = useCallback((clientY: number) => {
    if (startY.current === null) return;
    const delta = startY.current - clientY;           // hacia arriba = positivo
    const newValue = Math.min(1, Math.max(0, startValue.current + delta / DRAG_RANGE_PX));
    onChange(newValue);
  }, [onChange]);

  const onEnd = useCallback(() => {
    startY.current = null;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onEnd);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onEnd);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Necesitamos referencias estables para poder removerlas
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onMouseMove = useCallback((e: MouseEvent) => onMove(e.clientY), [onMove]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onTouchMove = useCallback((e: TouchEvent) => onMove(e.touches[0].clientY), [onMove]);

  const onStart = useCallback((clientY: number) => {
    startY.current = clientY;
    startValue.current = value;
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onEnd);
  }, [value, onMouseMove, onTouchMove, onEnd]);

  // Cleanup al desmontar
  useEffect(() => () => onEnd(), [onEnd]);

  return (
    <svg
      width={size}
      height={size}
      className="knob"
      onMouseDown={e => { e.preventDefault(); onStart(e.clientY); }}
      onTouchStart={e => onStart(e.touches[0].clientY)}
      style={{ cursor: 'ns-resize', flexShrink: 0, userSelect: 'none' }}
    >
      {/* Pista de fondo */}
      <circle
        cx={r}
        cy={r}
        r={r - 2}
        fill="#1a1a1a"
        stroke="#333"
        strokeWidth={1.5}
      />
      {/* Indicador */}
      <circle
        cx={ix}
        cy={iy}
        r={3}
        fill="var(--accent)"
      />
    </svg>
  );
}
