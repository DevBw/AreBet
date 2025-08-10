import React, { useMemo } from 'react';
import Card from '../components/Card.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { useParams } from 'react-router-dom';
import { useTeams } from '../hooks/useTeams';
import { useApi } from '../hooks/useApi';
import { apiFootball } from '../services/apiFootball';

export default function TeamProfile() {
  const { teamId } = useParams();
  const { data, loading, error } = useTeams({ id: teamId });
  const team = useMemo(() => data?.response?.[0], [data]);
  const season = new Date().getFullYear();
  const { data: playersData, loading: playersLoading } = useApi(() => (
    teamId ? apiFootball.getTeamPlayers({ team: teamId, season, page: 1 }) : Promise.resolve(null)
  ), [teamId, season]);
  const { data: teamStatsData } = useApi(() => (
    teamId ? apiFootball.getTrends({ team: teamId, season }) : Promise.resolve(null)
  ), [teamId, season]);
  return (
    <div className="ab-stack">
      <Breadcrumbs items={[{ label: 'Teams', to: '/teams' }, { label: 'Team Profile' }]} />
      <Card title="Overview">
        {loading && <Loader label="Loading team" />}
        {error && <ErrorState title="Could not load team" message="Try again later" />}
        {!loading && !error && team && (
          <div>
            <div>{team.team?.name}</div>
            <div className="ab-muted">Country: {team.team?.country}</div>
          </div>
        )}
      </Card>
      <Card title="Statistics">
        {teamStatsData?.response ? (
          <ul className="ab-list">
            <li>Matches: {teamStatsData.response?.fixtures?.played?.total}</li>
            <li>Wins: {teamStatsData.response?.fixtures?.wins?.total}</li>
            <li>Draws: {teamStatsData.response?.fixtures?.draws?.total}</li>
            <li>Losses: {teamStatsData.response?.fixtures?.loses?.total}</li>
            <li>Goals For: {teamStatsData.response?.goals?.for?.total?.total}</li>
            <li>Goals Against: {teamStatsData.response?.goals?.against?.total?.total}</li>
          </ul>
        ) : (
          <div className="ab-muted">No team statistics available.</div>
        )}
      </Card>
      <Card title="Players">
        {playersLoading && <Loader label="Loading players" />}
        {playersData?.response ? (
          <ul className="ab-list">
            {playersData.response.slice(0, 12).map((p) => (
              <li key={`${p.player?.id}`}>{p.player?.name} — {p.statistics?.[0]?.games?.position}</li>
            ))}
          </ul>
        ) : (
          <div className="ab-muted">No players found.</div>
        )}
      </Card>
    </div>
  );
}


