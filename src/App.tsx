import { useCallback, useEffect, useRef, useState } from 'react';
import { MetronomeScheduler } from './engine/scheduler';
import { buildPatterns, type ClaveType, type PercussionPattern } from './engine/patterns';
import { GENRES, getGenre, type GenreId, type StepDuration } from './engine/genres';
import { BpmControl } from './components/BpmControl';
import { PercussionToggle } from './components/PercussionToggle';
import { GenreSelect } from './components/GenreSelect';
import './styles/main.css';

const DEFAULT_VOLUME = 0.8;

function buildDefaultVolumes(patterns: PercussionPattern[]): Record<string, number> {
  return Object.fromEntries(patterns.map(p => [p.id, DEFAULT_VOLUME]));
}

export default function App() {
  const [genreId, setGenreId] = useState<GenreId | null>(null);
  const [bpm, setBpm] = useState(100);
  const [claveType, setClaveType] = useState<ClaveType>('2-3');
  const [stepDuration, setStepDuration] = useState<StepDuration>('eighth');
  const [activePercussions, setActivePercussions] = useState<Set<string>>(new Set());
  const [patterns, setPatterns] = useState<PercussionPattern[]>([]);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const schedulerRef = useRef<MetronomeScheduler | null>(null);

  // ── Inicializar cuando cambia el género ───────────────────────────────────
  useEffect(() => {
    if (!genreId) return;
    if (genreId === 'salsa') {
      const p = buildPatterns(claveType);
      setPatterns(p);
      setVolumes(buildDefaultVolumes(p));
      setBpm(174);
      setStepDuration('eighth');
      setActivePercussions(new Set(['beat', 'clave', 'conga', 'timbal']));
    } else {
      const genre = getGenre(genreId);
      setPatterns(genre.instruments);
      setVolumes(buildDefaultVolumes(genre.instruments));
      setBpm(genre.defaultBpm);
      setStepDuration(genre.stepDuration);
      setActivePercussions(new Set(genre.defaultActive));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genreId]);

  // ── Reconstruir patrones de salsa al cambiar tipo de clave ────────────────
  useEffect(() => {
    if (genreId !== 'salsa') return;
    const p = buildPatterns(claveType);
    setPatterns(p);
    setVolumes(prev => {
      const next = { ...prev };
      p.forEach(pat => { if (!(pat.id in next)) next[pat.id] = DEFAULT_VOLUME; });
      return next;
    });
  }, [claveType, genreId]);

  // ── Sincronizar scheduler con el estado ──────────────────────────────────
  useEffect(() => {
    schedulerRef.current?.updateState({ bpm, activePercussions, volumes, patterns, stepDuration });
  }, [bpm, activePercussions, volumes, patterns, stepDuration]);

  const handleBeatCallback = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // ── Play / Stop ───────────────────────────────────────────────────────────
  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      schedulerRef.current?.stop();
      schedulerRef.current = null;
      setIsPlaying(false);
      setCurrentStep(-1);
    } else {
      schedulerRef.current = new MetronomeScheduler({
        bpm, activePercussions, volumes, patterns, stepDuration,
        onBeat: handleBeatCallback,
      });
      await schedulerRef.current.start();
      setIsPlaying(true);
    }
  }, [isPlaying, bpm, activePercussions, volumes, patterns, stepDuration, handleBeatCallback]);

  // ── Volver al selector de géneros ────────────────────────────────────────
  const handleBack = useCallback(() => {
    schedulerRef.current?.stop();
    schedulerRef.current = null;
    setIsPlaying(false);
    setCurrentStep(-1);
    setGenreId(null);
  }, []);

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

  const applyRecommended = useCallback(() => {
    setBpm(174);
    setClaveType('3-2');
    setActivePercussions(new Set(['beat', 'clave', 'conga', 'timbal']));
  }, []);

  useEffect(() => {
    return () => schedulerRef.current?.stop();
  }, []);

  // ── Pantalla de selección de género ──────────────────────────────────────
  if (!genreId) {
    return <GenreSelect onSelect={setGenreId} />;
  }

  const genreConfig = GENRES.find(g => g.id === genreId)!;
  const beat = currentStep >= 0 ? Math.floor(currentStep / 4) % 4 : -1;

  return (
    <div className="app">
      <header className="app-header">
        <button className="back-btn" onClick={handleBack} aria-label="Volver">
          ←
        </button>
        <div>
          <h1 className="app-title">Metrónomo Latino</h1>
          <p className="app-subtitle">{genreConfig.name}</p>
        </div>
        <div style={{ width: 36 }} /> {/* espaciador para centrar el título */}
      </header>

      <div className="pulse-bar">
        {[0, 1, 2, 3].map(b => (
          <div key={b} className={`pulse-dot ${b === beat && isPlaying ? 'pulse-active' : ''}`} />
        ))}
      </div>

      <BpmControl bpm={bpm} onChange={setBpm} />

      {/* Selector de clave — solo para Salsa */}
      {genreId === 'salsa' && (
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
          <button className="recommended-btn" onClick={applyRecommended}>
            Recomendada
          </button>
        </div>
      )}

      <div className="percussion-list">
        {patterns.map(pattern => (
          <PercussionToggle
            key={pattern.id}
            pattern={pattern}
            active={activePercussions.has(pattern.id)}
            currentStep={currentStep}
            volume={volumes[pattern.id] ?? DEFAULT_VOLUME}
            onToggle={() => togglePercussion(pattern.id)}
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
