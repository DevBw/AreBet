import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useFixturesByDate } from '../hooks/useMatches';
import { toISODate, formatDate } from '../utils/date';
import { groupBy } from '../utils/grouping';

export default function Fixtures() {
  const [date, setDate] = useState(toISODate());
  const { data, loading, error } = useFixturesByDate(date);
  const fixtures = useMemo(() => data?.response ?? [], [data]);
  const byLeague = useMemo(() => groupBy(fixtures, (f) => f.league?.name ?? 'Other'), [fixtures]);

  function stepDay(delta) {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    setDate(toISODate(d));
  }

  return (
    <div className="ab-stack">
      <Card title="Date Navigator">
        <div className="ab-row">
          <button className="ab-button" aria-label="Previous day" onClick={() => stepDay(-1)}>Prev</button>
          <strong>{formatDate(date, { weekday: 'short' })}</strong>
          <button className="ab-button" aria-label="Next day" onClick={() => stepDay(1)}>Next</button>
        </div>
      </Card>
      <Card title="Fixtures by Date">
        <div className="ab-sticky">{formatDate(date)}</div>
        {loading && <Loader label="Loading fixtures" />}
        {error && <ErrorState title="Could not load fixtures" message="Try again later" />}
        {!loading && !error && fixtures.length === 0 && (
          <div className="ab-muted">No fixtures found for {formatDate(date)}.</div>
        )}
        {!loading && !error && fixtures.length > 0 && (
          <div className="ab-stack">
            {Object.entries(byLeague).map(([league, list]) => (
              <section key={league} aria-label={league}>
                <h4 className="ab-muted">{league}</h4>
                <ul className="ab-list">
                  {list.map((fx) => (
                    <li key={fx.fixture?.id}>{fx.teams?.home?.name} vs {fx.teams?.away?.name}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


