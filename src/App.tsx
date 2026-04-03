import { useCallback, useEffect, useRef, useState } from 'react';
import { MetronomeScheduler } from './engine/scheduler';
import { buildPatterns, type ClaveType, type PercussionId } from './engine/patterns';
import { BpmControl } from './components/BpmControl';
import { PercussionToggle } from './components/PercussionToggle';
import './styles/main.css';

const DEFAULT_BPM = 100;
const DEFAULT_ACTIVE = new Set<string>(['clave', 'conga']);

export default function App() {
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [claveType, setClaveType] = useState<ClaveType>('2-3');
  const [activePercussions, setActivePercussions] = useState<Set<string>>(DEFAULT_ACTIVE);
  const [patterns, setPatterns] = useState(() => buildPatterns('2-3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const schedulerRef = useRef<MetronomeScheduler | null>(null);

  useEffect(() => {
    setPatterns(buildPatterns(claveType));
  }, [claveType]);

  useEffect(() => {
    schedulerRef.current?.updateState({ bpm, activePercussions, patterns });
  }, [bpm, activePercussions, patterns]);

  const handleBeatCallback = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      schedulerRef.current?.stop();
      schedulerRef.current = null;
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      schedulerRef.current = new MetronomeScheduler({
        bpm,
        activePercussions,
        patterns,
        onBeat: handleBeatCallback,
      });
      schedulerRef.current.start();
      setIsPlaying(true);
    }
  }, [isPlaying, bpm, activePercussions, patterns, handleBeatCallback]);

  const togglePercussion = useCallback((id: string) => {
    setActivePercussions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    return () => schedulerRef.current?.stop();
  }, []);

  const beat = currentStep >= 0 ? Math.floor(currentStep / 2) % 4 : -1;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Metrónomo Latino</h1>
        <p className="app-subtitle">Salsa</p>
      </header>

      <div className="pulse-bar">
        {[0, 1, 2, 3].map(b => (
          <div key={b} className={`pulse-dot ${b === beat && isPlaying ? 'pulse-active' : ''}`} />
        ))}
      </div>

      <BpmControl bpm={bpm} onChange={setBpm} />

      <div className="clave-selector">
        <span className="clave-label">Clave</span>
        <div className="clave-options">
          {(['2-3', '3-2'] as ClaveType[]).map(type => (
            <button
              key={type}
              className={`clave-btn ${claveType === type ? 'selected' : ''}`}
              onClick={() => setClaveType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="percussion-list">
        {patterns.map(pattern => (
          <PercussionToggle
            key={pattern.id}
            pattern={pattern}
            active={activePercussions.has(pattern.id)}
            currentStep={currentStep}
            onToggle={() => togglePercussion(pattern.id as PercussionId)}
          />
        ))}
      </div>

      <button
        className={`play-btn ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
        aria-label={isPlaying ? 'Detener' : 'Iniciar'}
      >
        {isPlaying ? '⏹' : '▶'}
      </button>
    </div>
  );
}
