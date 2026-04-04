import { GENRES, type GenreId } from '../engine/genres';

interface Props {
  onSelect: (id: GenreId) => void;
}

export function GenreSelect({ onSelect }: Props) {
  return (
    <div className="genre-select">
      <header className="app-header">
        <h1 className="app-title">Metrónomo Latino</h1>
        <p className="app-subtitle">Elegí un ritmo</p>
      </header>

      <div className="genre-grid">
        {GENRES.map(genre => (
          <button
            key={genre.id}
            className="genre-card"
            onClick={() => onSelect(genre.id)}
          >
            <div className="genre-card-emoji">{genre.emoji}</div>
            <div className="genre-card-name">{genre.name}</div>
            <div className="genre-card-desc">{genre.description}</div>
            <div className="genre-card-tempo">
              {genre.tempoRange[0]}–{genre.tempoRange[1]} BPM
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
