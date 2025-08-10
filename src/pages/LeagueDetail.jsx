import React, { useMemo } from 'react';
import Card from '../components/Card.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useParams } from 'react-router-dom';
import { useLeagues } from '../hooks/useLeagues';
import { useApi } from '../hooks/useApi';
import { apiFootball } from '../services/apiFootball';

export default function LeagueDetail() {
  const { leagueId } = useParams();
  const { data, loading, error } = useLeagues();
  const league = useMemo(() => (data?.response ?? []).find((l) => String(l.league?.id) === String(leagueId)), [data, leagueId]);
  const season = new Date().getFullYear();
  const { data: standingsData, loading: standingsLoading } = useApi(() => (
    leagueId ? apiFootball.getStandings({ league: leagueId, season }) : Promise.resolve(null)
  ), [leagueId, season]);
  return (
    <div className="ab-stack">
      <Breadcrumbs items={[{ label: 'Leagues', to: '/leagues' }, { label: 'League Detail' }]} />
      <Card title="Standings">
        {(loading || standingsLoading) && <Loader label="Loading league" />}
        {error && <ErrorState title="Could not load league" message="Try again later" />}
        {!loading && !error && league && (
          <div className="ab-muted">{league.league?.name} — {league.country?.name}</div>
        )}
        {standingsData?.response?.[0]?.league?.standings && (
          <ul className="ab-list">
            {standingsData.response[0].league.standings?.[0]?.slice(0, 10).map((row) => (
              <li key={row.team?.id}>{row.rank}. {row.team?.name} — {row.points} pts</li>
            ))}
          </ul>
        )}
      </Card>
      <Card title="Top Performers">
        {leagueId && (
          <TopPerformers leagueId={leagueId} />
        )}
      </Card>
    </div>
  );
}

function TopPerformers({ leagueId }) {
  const season = new Date().getFullYear();
  const { data: scorersData, loading: scorersLoading } = useApi(() => apiFootball.getTopScorers({ league: leagueId, season }), [leagueId, season]);
  const { data: assistsData, loading: assistsLoading } = useApi(() => apiFootball.getTopAssists({ league: leagueId, season }), [leagueId, season]);
  if (scorersLoading || assistsLoading) return <Loader label="Loading top performers" />;
  return (
    <div className="ab-grid-2">
      <div>
        <strong>Top Scorers</strong>
        <ul className="ab-list">
          {scorersData?.response?.slice(0, 10).map((p) => (
            <li key={p.player?.id}>{p.player?.name} — {p.statistics?.[0]?.goals?.total}</li>
          ))}
        </ul>
      </div>
      <div>
        <strong>Top Assists</strong>
        <ul className="ab-list">
          {assistsData?.response?.slice(0, 10).map((p) => (
            <li key={p.player?.id}>{p.player?.name} — {p.statistics?.[0]?.goals?.assists}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}


