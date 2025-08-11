import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import TabBar from '../components/TabBar.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import SmartMatchCard from '../components/SmartMatchCard.jsx';
import { useLiveMatches, useMatches } from '../hooks/useMatches';

const tabs = [
  { label: 'Live', value: 'live' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Finished', value: 'finished' },
  { label: 'Leagues', value: 'leagues' },
];

export default function Matches() {
  const [active, setActive] = useState('live');
  const [query, setQuery] = useState('');

  const { data: liveData, loading: liveLoading, error: liveError } = useLiveMatches();
  const live = useMemo(() => liveData?.response ?? [], [liveData]);

  const { data: upData, loading: upLoading, error: upError } = useMatches({ status: 'NS' });
  const upcoming = useMemo(() => upData?.response ?? [], [upData]);

  const { data: finData, loading: finLoading, error: finError } = useMatches({ status: 'FT' });
  const finished = useMemo(() => finData?.response ?? [], [finData]);

  const isLoading = active === 'live' ? liveLoading : active === 'upcoming' ? upLoading : active === 'finished' ? finLoading : false;
  const isError = active === 'live' ? liveError : active === 'upcoming' ? upError : active === 'finished' ? finError : null;
  const list = active === 'live' ? live : active === 'upcoming' ? upcoming : active === 'finished' ? finished : [];
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return list;
    return list.filter((f) => `${f.teams?.home?.name} ${f.teams?.away?.name}`.toLowerCase().includes(q));
  }, [list, query]);
  return (
    <div className="ab-stack">
      <TabBar tabs={tabs} active={active} onChange={setActive} ariaLabel="Matches Tabs" />
      <Card title="Search & Filters">
        <div className="ab-row">
          <input className="ab-input" placeholder="Search teams or leagues" aria-label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="ab-button">Filters</button>
        </div>
      </Card>
      <Card title="Results">
        {isLoading && <Loader label="Loading matches" />}
        {isError && <ErrorState title="Could not load matches" message="Try again later" />}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="ab-muted">No results.</div>
        )}
        {!isLoading && !isError && filtered.length > 0 && (
          <div className="ab-matches-list">
            {filtered.slice(0, 20).map((match) => (
              <SmartMatchCard 
                key={match.fixture?.id} 
                match={match}
                variant={active === 'live' ? 'live' : active === 'finished' ? 'finished' : 'upcoming'}
                showExpanded={false}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}


