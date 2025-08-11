import React, { useMemo } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useLeagues } from '../hooks/useLeagues';
import { useFavorites } from '../hooks/useFavorites';

export default function Leagues() {
  const { data, loading, error } = useLeagues();
  const leagues = useMemo(() => data?.response ?? [], [data]);
  const { isFav, toggle } = useFavorites('demo-user', 'league');

  return (
    <div className="ab-stack">
      <Card title="Popular Leagues">
        {loading && <Loader label="Loading leagues" />}
        {error && <ErrorState title="Could not load leagues" message="Try again later" />}
        {!loading && !error && (
          <div className="ab-grid-3">
            {leagues
              .filter((l) => l.league?.name && l.league?.type === 'League' && l.seasons?.some?.(() => true))
              .slice(0, 6)
              .map((l) => (
                <div className="ab-tile" key={`${l.league?.id}-${l.country?.name}`}>
                  <div className="ab-row" style={{ justifyContent: 'space-between' }}>
                    <span>{l.league?.name}</span>
                    <button
                      className="ab-chip"
                      aria-pressed={isFav(l.league?.id)}
                      onClick={() => toggle(l.league?.id, l.league?.name)}
                      title={isFav(l.league?.id) ? 'Remove favorite' : 'Add favorite'}
                    >
                      {isFav(l.league?.id) ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
      <Card title="Other Leagues">
        {!loading && !error && (
          <div className="ab-grid-4">
            {leagues.slice(6, 18).map((l) => (
              <div className="ab-tile" key={`${l.league?.id}-${l.country?.name}`}>
                <div className="ab-row" style={{ justifyContent: 'space-between' }}>
                  <span>{l.league?.name}</span>
                  <button
                    className="ab-chip"
                    aria-pressed={isFav(l.league?.id)}
                    onClick={() => toggle(l.league?.id, l.league?.name)}
                    title={isFav(l.league?.id) ? 'Remove favorite' : 'Add favorite'}
                  >
                    {isFav(l.league?.id) ? '★' : '☆'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title="League Statistics">
        <div className="ab-league-stats">
          <div className="ab-league-stat-item">
            <div className="ab-league-stat-icon">⚽</div>
            <div className="ab-league-stat-content">
              <div className="ab-league-stat-title">Goals per Game</div>
              <div className="ab-league-stat-value">2.7</div>
              <div className="ab-league-stat-subtitle">Season average</div>
            </div>
          </div>
          <div className="ab-league-stat-item">
            <div className="ab-league-stat-icon">🏆</div>
            <div className="ab-league-stat-content">
              <div className="ab-league-stat-title">Top Scorer</div>
              <div className="ab-league-stat-value">E. Haaland</div>
              <div className="ab-league-stat-subtitle">15 goals</div>
            </div>
          </div>
          <div className="ab-league-stat-item">
            <div className="ab-league-stat-icon">🎯</div>
            <div className="ab-league-stat-content">
              <div className="ab-league-stat-title">BTTS Rate</div>
              <div className="ab-league-stat-value">64%</div>
              <div className="ab-league-stat-subtitle">Both teams score</div>
            </div>
          </div>
          <div className="ab-league-stat-item">
            <div className="ab-league-stat-icon">🏟️</div>
            <div className="ab-league-stat-content">
              <div className="ab-league-stat-title">Home Advantage</div>
              <div className="ab-league-stat-value">58%</div>
              <div className="ab-league-stat-subtitle">Home win rate</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


