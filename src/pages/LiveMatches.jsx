import React, { useMemo } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useLiveMatches } from '../hooks/useMatches';

export default function LiveMatches() {
  const { data, loading, error, refetch } = useLiveMatches();
  const matches = useMemo(() => data?.response ?? [], [data]);

  return (
    <div className="ab-stack">
      <Card title="League Filters">
        <div className="ab-chip-row">
          <button className="ab-chip" aria-pressed="false">EPL</button>
          <button className="ab-chip" aria-pressed="false">La Liga</button>
          <button className="ab-chip" aria-pressed="false">Serie A</button>
        </div>
      </Card>
      <Card title="Live Now" footer={<button className="ab-button" onClick={refetch}>Refresh</button>}>
        {loading && <Loader label="Loading live matches" />}
        {error && <ErrorState title="No matches right now" message="Try again later" />}
        {!loading && !error && matches.length === 0 && (
          <div className="ab-muted">No live matches at the moment.</div>
        )}
        {!loading && !error && matches.length > 0 && (
          <ul className="ab-list" aria-live="polite">
            {matches.slice(0, 10).map((fx) => (
              <li key={fx.fixture?.id}>
                <span className="ab-dot-live" aria-hidden="true">●</span> {fx.teams?.home?.name} vs {fx.teams?.away?.name} – {fx.goals?.home}:{fx.goals?.away}
              </li>
            ))}
          </ul>
        )}
        <div className="ab-muted" aria-live="polite">Last updated moments ago</div>
      </Card>
    </div>
  );
}


