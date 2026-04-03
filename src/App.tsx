import { useCallback, useEffect, useRef, useState } from 'react';
import { MetronomeScheduler } from './engine/scheduler';
import { buildPatterns, type ClaveType, type PercussionId } from './engine/patterns';
import { BpmControl } from './components/BpmControl';
import { PercussionToggle } from './components/PercussionToggle';
import './styles/main.css';

const DEFAULT_BPM = 100;
const DEFAULT_ACTIVE = new Set<string>(['beat', 'clave', 'conga']);
const DEFAULT_VOLUME = 0.8;

function buildDefaultVolumes(patterns: ReturnType<typeof buildPatterns>): Record<string, number> {
  return Object.fromEntries(patterns.map(p => [p.id, DEFAULT_VOLUME]));
}

export default function App() {
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [claveType, setClaveType] = useState<ClaveType>('2-3');
  const [activePercussions, setActivePercussions] = useState<Set<string>>(DEFAULT_ACTIVE);
  const [patterns, setPatterns] = useState(() => buildPatterns('2-3'));
  const [volumes, setVolumes] = useState<Record<string, number>>(() => buildDefaultVolumes(buildPatterns('2-3')));
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const schedulerRef = useRef<MetronomeScheduler | null>(null);

  useEffect(() => {
    const p = buildPatterns(claveType);
    setPatterns(p);
    setVolumes(prev => {
      const next = { ...prev };
      p.forEach(pat => { if (!(pat.id in next)) next[pat.id] = DEFAULT_VOLUME; });
      return next;
    });
  }, [claveType]);

  useEffect(() => {
    schedulerRef.current?.updateState({ bpm, activePercussions, volumes, patterns });
  }, [bpm, activePercussions, volumes, patterns]);

  const handleBeatCallback = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      schedulerRef.current?.stop();
      schedulerRef.current = null;
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      schedulerRef.current = new MetronomeScheduler({
        bpm,
        activePercussions,
        volumes,
        patterns,
        onBeat: handleBeatCallback,
      });
      await schedulerRef.current.start();
      setIsPlaying(true);
    }
  }, [isPlaying, bpm, activePercussions, volumes, patterns, handleBeatCallback]);

  const togglePercussion = useCallback((id: string) => {
    setActivePercussions(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const setVolume = useCallback((id: string, v: number) => {
    setVolumes(prev => ({ ...prev, [id]: v }));
  }, []);

  useEffect(() => {
    return () => schedulerRef.current?.stop();
  }, []);

  const beat = currentStep >= 0 ? Math.floor(currentStep / 4) % 4 : -1;

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
            volume={volumes[pattern.id] ?? DEFAULT_VOLUME}
            onToggle={() => togglePercussion(pattern.id as PercussionId)}
            onVolumeChange={v => setVolume(pattern.id, v)}
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
