import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useTeams } from '../hooks/useTeams';
import { useFavorites } from '../hooks/useFavorites';

export default function Teams() {
  const [league, setLeague] = useState('39'); // EPL as example
  const [season] = useState(new Date().getFullYear());
  const { data, loading, error } = useTeams({ league, season });
  const teams = useMemo(() => data?.response ?? [], [data]);
  const { isFav, toggle } = useFavorites('demo-user', 'team');

  return (
    <div className="ab-stack">
      <Card title="League Selectors">
        <div className="ab-chip-row">
          <button className="ab-chip" aria-pressed={league === '39'} onClick={() => setLeague('39')}>EPL</button>
          <button className="ab-chip" aria-pressed={league === '140'} onClick={() => setLeague('140')}>La Liga</button>
          <button className="ab-chip" aria-pressed={league === '135'} onClick={() => setLeague('135')}>Serie A</button>
        </div>
      </Card>
      <Card title="Teams">
        {loading && <Loader label="Loading teams" />}
        {error && <ErrorState title="Could not load teams" message="Try again later" />}
        {!loading && !error && (
          <div className="ab-grid-4">
            {teams.slice(0, 20).map((t) => (
              <div className="ab-tile" key={t.team?.id}>
                <div className="ab-row" style={{ justifyContent: 'space-between' }}>
                  <span>{t.team?.name}</span>
                  <button
                    className="ab-chip"
                    aria-pressed={isFav(t.team?.id)}
                    onClick={() => toggle(t.team?.id, t.team?.name)}
                    title={isFav(t.team?.id) ? 'Remove favorite' : 'Add favorite'}
                  >
                    {isFav(t.team?.id) ? '★' : '☆'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


