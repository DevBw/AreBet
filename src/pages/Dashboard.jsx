import React, { useMemo } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import KPIChip from '../components/KPIChip.jsx';
import AnalyticsPanel from '../components/AnalyticsPanel.jsx';
import ErrorState from '../components/ErrorState.jsx';
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
      <div className="ab-row">
        <Card title="Live Matches" footer={<a className="ab-link" href="/live">See all</a>}>
          {liveLoading && <Loader label="Loading live matches" />}
          {liveError && <ErrorState title="No matches right now" message="Try again later" />}
          {!liveLoading && !liveError && (
            <ul className="ab-list" aria-live="polite">
              {live.slice(0, 6).map((fx) => (
                <li key={fx.fixture?.id}><span className="ab-dot-live">●</span>{fx.teams?.home?.name} vs {fx.teams?.away?.name}</li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Upcoming Fixtures" footer={<a className="ab-link" href="/fixtures">See all</a>}>
          {fixturesLoading && <Loader label="Loading fixtures" />}
          {fixturesError && <ErrorState title="Could not load fixtures" message="Try again later" />}
          {!fixturesLoading && !fixturesError && (
            <div className="ab-grid-2">
              <KPIChip label="TODAY" value={fixtures.length} />
              <KPIChip label="WEEK" value="--" />
            </div>
          )}
        </Card>
      </div>
      <AnalyticsPanel title="Hot Picks">
        {picksLoading && <Loader label="Loading picks" />}
        {picksError && <ErrorState title="Could not load picks" message="Try again later" />}
        {!picksLoading && !picksError && picks.length === 0 && (
          <div className="ab-muted">No picks available now.</div>
        )}
        {!picksLoading && !picksError && picks.length > 0 && (
          <ul className="ab-list">
            {picks.map((p) => (
              <li key={p.fixtureId}>
                {p.home} vs {p.away} — {p.advice || `${p.side} ${p.best}%`}
              </li>
            ))}
          </ul>
        )}
      </AnalyticsPanel>
      <div className="ab-row">
        <Card title="Compact Charts">
          <div className="ab-placeholder">Mini charts</div>
        </Card>
        <Card title="Venue Analysis">
          <div className="ab-placeholder">Home vs Away breakdown</div>
        </Card>
      </div>
    </div>
  );
}


