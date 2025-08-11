import React, { useMemo } from 'react';
import Card from '../components/Card.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import SmartMatchCard from '../components/SmartMatchCard.jsx';
import { useParams } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { apiFootball } from '../services/apiFootball';
import AnalyticsChart from '../components/AnalyticsChart.jsx';

export default function MatchDetail() {
  const { matchId } = useParams();
  const { data, loading, error } = useApi(() => apiFootball.getFixtureById(matchId), [matchId]);
  const fx = useMemo(() => data?.response?.[0] ?? null, [data]);
  const homeId = fx?.teams?.home?.id;
  const awayId = fx?.teams?.away?.id;
  const fixtureId = fx?.fixture?.id;
  const { data: statsData } = useApi(() => (fixtureId ? apiFootball.getStatistics({ fixture: fixtureId, team: homeId }) : Promise.resolve(null)), [fixtureId, homeId]);
  const { data: statsAwayData } = useApi(() => (fixtureId ? apiFootball.getStatistics({ fixture: fixtureId, team: awayId }) : Promise.resolve(null)), [fixtureId, awayId]);
  const { data: lineupsData } = useApi(() => (fixtureId ? apiFootball.getLineups({ fixture: fixtureId }) : Promise.resolve(null)), [fixtureId]);
  const { data: h2hData } = useApi(() => (homeId && awayId ? apiFootball.getH2H({ home: homeId, away: awayId, last: 5 }) : Promise.resolve(null)), [homeId, awayId]);
  const { data: eventsData } = useApi(() => (fixtureId ? apiFootball.getEvents({ fixture: fixtureId }) : Promise.resolve(null)), [fixtureId]);
  const getMatchVariant = () => {
    if (!fx?.fixture?.status) return 'upcoming';
    const status = fx.fixture.status.short;
    if (status === 'LIVE' || status === '1H' || status === '2H') return 'live';
    if (status === 'FT') return 'finished';
    return 'upcoming';
  };

  return (
    <div className="ab-stack">
      <Breadcrumbs items={[{ label: 'Matches', to: '/matches' }, { label: 'Match Detail' }]} />
      
      {/* Enhanced Match Overview */}
      {loading && <Loader label="Loading match" />}
      {error && <ErrorState title="Could not load match" message="Try again later" />}
      {!loading && !error && fx && (
        <SmartMatchCard 
          match={fx}
          variant={getMatchVariant()}
          showExpanded={true}
        />
      )}
      <Card title="Insights">
        <div className="ab-muted">Powered by Api-Football predictions.</div>
      </Card>
      <Card title="Charts">
        {eventsData?.response ? (
          <AnalyticsChart
            ariaLabel="Match momentum timeline"
            labels={eventsData.response.map((e) => `${e.time?.elapsed}'`).slice(0, 30)}
            series={[{
              label: 'Event Intensity',
              data: eventsData.response.map((e) => (e.type === 'Goal' ? 3 : e.type === 'Card' ? 2 : 1)).slice(0, 30),
            }]}
          />
        ) : (
          <div className="ab-muted">No timeline available.</div>
        )}
      </Card>
      <Card title="Venue">
        {!loading && !error && fx && (
          <div className="ab-muted">{fx.fixture?.venue?.name} — {fx.fixture?.venue?.city}</div>
        )}
      </Card>
      <Card title="Statistics">
        {(statsData?.response || statsAwayData?.response) ? (
          <div className="ab-grid-2">
            <div>
              <strong>{fx?.teams?.home?.name}</strong>
              <ul className="ab-list">
                {statsData?.response?.[0]?.statistics?.slice?.(0, 6)?.map((s) => (
                  <li key={s.type}>{s.type}: {s.value}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>{fx?.teams?.away?.name}</strong>
              <ul className="ab-list">
                {statsAwayData?.response?.[0]?.statistics?.slice?.(0, 6)?.map((s) => (
                  <li key={s.type}>{s.type}: {s.value}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="ab-muted">No statistics available.</div>
        )}
      </Card>
      <Card title="Events Timeline">
        {eventsData?.response ? (
          <ul className="ab-list">
            {eventsData.response.slice(0, 20).map((ev, idx) => (
              <li key={`${ev.time?.elapsed}-${idx}`}>{ev.time?.elapsed}' {ev.team?.name}: {ev.type} {ev.detail}</li>
            ))}
          </ul>
        ) : (
          <div className="ab-muted">No events recorded.</div>
        )}
      </Card>
      <Card title="Lineups">
        {lineupsData?.response ? (
          <div className="ab-grid-2">
            {lineupsData.response.slice(0, 2).map((l) => (
              <div key={l.team?.id}>
                <strong>{l.team?.name}</strong>
                <div className="ab-muted">Formation: {l.formation}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ab-muted">No lineups available.</div>
        )}
      </Card>
      <Card title="H2H">
        {h2hData?.response ? (
          <ul className="ab-list">
            {h2hData.response.slice(0, 5).map((m) => (
              <li key={m.fixture?.id}>{m.teams?.home?.name} {m.goals?.home} - {m.goals?.away} {m.teams?.away?.name}</li>
            ))}
          </ul>
        ) : (
          <div className="ab-muted">No H2H available.</div>
        )}
      </Card>
      <Card title="Predictions">
        <div className="ab-muted">Api-Football predictions shown here.</div>
      </Card>
    </div>
  );
}


