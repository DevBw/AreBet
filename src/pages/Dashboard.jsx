import React, { useMemo } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import KPIChip from '../components/KPIChip.jsx';
import AnalyticsPanel from '../components/AnalyticsPanel.jsx';
import ErrorState from '../components/ErrorState.jsx';
import SmartMatchCard from '../components/SmartMatchCard.jsx';
import { FormTrendsChart, VenueAnalysisChart } from '../components/MiniChart.jsx';
import { useLiveMatches, useFixturesRange } from '../hooks/useMatches';
import { toISODate } from '../utils/date';
import { useHotPicks } from '../hooks/useHotPicks';

export default function Dashboard() {
  const { data: liveData, loading: liveLoading, error: liveError } = useLiveMatches();
  const today = toISODate();
  const { data: fixturesData, loading: fixturesLoading, error: fixturesError } = useFixturesRange(today, today);
  const live = useMemo(() => liveData?.response ?? [], [liveData]);
  const fixtures = useMemo(() => fixturesData?.response ?? [], [fixturesData]);
  const { picks, loading: picksLoading, error: picksError } = useHotPicks(5);

  return (
    <div className="ab-stack-lg">
      {/* Header KPIs */}
      <div className="ab-kpi-grid">
        <KPIChip label="LIVE NOW" value={live.length} tone="positive" size="large" />
        <KPIChip label="TODAY" value={fixtures.length} tone="neutral" size="large" />
        <KPIChip label="HOT PICKS" value={picks.length} tone="warning" size="large" />
        <KPIChip label="LEAGUES" value="--" tone="neutral" size="large" />
      </div>

      {/* Main Content Grid */}
      <div className="ab-dashboard-grid">
        <Card title="Live Matches" footer={<a className="ab-link" href="/live">See all live matches</a>}>
          {liveLoading && <Loader label="Loading live matches" size="small" />}
          {liveError && <ErrorState title="No matches right now" message="Check back later for live action" icon="⚽" />}
          {!liveLoading && !liveError && live.length === 0 && (
            <ErrorState title="No live matches" message="All matches are finished or not started yet" icon="🏟️" />
          )}
          {!liveLoading && !liveError && live.length > 0 && (
            <div className="ab-dashboard-matches" aria-live="polite">
              {live.slice(0, 3).map((match) => (
                <SmartMatchCard 
                  key={match.fixture?.id} 
                  match={match}
                  variant="live"
                  showExpanded={false}
                />
              ))}
            </div>
          )}
        </Card>

        <Card title="Upcoming Fixtures" footer={<a className="ab-link" href="/fixtures">View all fixtures</a>}>
          {fixturesLoading && <Loader label="Loading fixtures" size="small" />}
          {fixturesError && <ErrorState title="Could not load fixtures" message="Try refreshing the page" icon="📅" />}
          {!fixturesLoading && !fixturesError && fixtures.length === 0 && (
            <div className="ab-muted">No fixtures scheduled for today.</div>
          )}
          {!fixturesLoading && !fixturesError && fixtures.length > 0 && (
            <div className="ab-fixtures-summary">
              <div className="ab-grid-2">
                <KPIChip label="TODAY" value={fixtures.length} tone="neutral" />
                <KPIChip label="THIS WEEK" value="--" tone="neutral" />
              </div>
              <div className="ab-dashboard-matches">
                {fixtures.slice(0, 2).map((match) => (
                  <SmartMatchCard 
                    key={match.fixture?.id} 
                    match={match}
                    variant="upcoming"
                    showExpanded={false}
                  />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Hot Picks Section */}
      <AnalyticsPanel title="Hot Picks" chartType="bar">
        {picksLoading && <Loader label="Loading picks" />}
        {picksError && <ErrorState title="Could not load picks" message="Try again later" icon="🔥" />}
        {!picksLoading && !picksError && picks.length === 0 && (
          <ErrorState title="No picks available" message="Check back later for expert insights" icon="🎯" />
        )}
        {!picksLoading && !picksError && picks.length > 0 && (
          <div className="ab-picks-grid">
            {picks.map((p) => (
              <div key={p.fixtureId} className="ab-pick-item">
                <div className="ab-pick-match">{p.home} vs {p.away}</div>
                <div className="ab-pick-advice">{p.advice || `${p.side} ${p.best}%`}</div>
                <div className="ab-pick-confidence">
                  <KPIChip label="CONF" value={`${p.confidence || 85}%`} tone="positive" size="small" />
                </div>
              </div>
            ))}
          </div>
        )}
      </AnalyticsPanel>

      {/* Analytics Row */}
      <div className="ab-dashboard-grid">
        <Card title="Match Trends">
          <FormTrendsChart />
        </Card>
        <Card title="Venue Analysis">
          <VenueAnalysisChart />
        </Card>
      </div>
    </div>
  );
}


