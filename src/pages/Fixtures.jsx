import React, { useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import Loader from '../components/Loader.jsx';
import ErrorState from '../components/ErrorState.jsx';
import KPIChip from '../components/KPIChip.jsx';
import { useFixturesRange } from '../hooks/useMatches';
import { toISODate, addDays, formatDate } from '../utils/date';

export default function Fixtures() {
  const [selectedDate, setSelectedDate] = useState(toISODate());
  const [dateRange, setDateRange] = useState(7); // days
  
  const { data, loading, error } = useFixturesRange(selectedDate, addDays(selectedDate, dateRange - 1));
  const fixtures = useMemo(() => data?.response ?? [], [data]);

  // Group fixtures by date
  const groupedFixtures = useMemo(() => {
    const groups = {};
    fixtures.forEach(fixture => {
      const date = fixture.fixture?.date?.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(fixture);
    });
    return groups;
  }, [fixtures]);

  // Generate date options for navigation
  const dateOptions = useMemo(() => {
    const options = [];
    for (let i = 0; i < 14; i++) {
      const date = addDays(toISODate(), i);
      options.push({
        value: date,
        label: formatDate(date, i === 0 ? 'Today' : undefined)
      });
    }
    return options;
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleRangeChange = (range) => {
    setDateRange(range);
  };

  return (
    <div className="ab-stack">
      {/* Date Navigation */}
      <Card title="Date Navigator">
        <div className="ab-date-navigation">
          <div className="ab-date-selector">
            <label htmlFor="date-select" className="ab-label">Select Date:</label>
            <select 
              id="date-select"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="ab-select"
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="ab-range-selector">
            <label htmlFor="range-select" className="ab-label">Range:</label>
            <select 
              id="range-select"
              value={dateRange}
              onChange={(e) => handleRangeChange(Number(e.target.value))}
              className="ab-select"
            >
              <option value={1}>1 Day</option>
              <option value={3}>3 Days</option>
              <option value={7}>1 Week</option>
              <option value={14}>2 Weeks</option>
            </select>
          </div>
        </div>
        <div className="ab-date-stats">
          <KPIChip label="TOTAL" value={fixtures.length} tone="neutral" />
          <KPIChip label="DAYS" value={dateRange} tone="neutral" />
          <KPIChip label="AVG/DAY" value={fixtures.length > 0 ? Math.round(fixtures.length / dateRange) : 0} tone="positive" />
        </div>
      </Card>

      {/* Fixtures List */}
      <Card title="Fixtures" footer={
        <div className="ab-fixtures-footer">
          <span className="ab-fixtures-count">
            Showing {fixtures.length} fixtures across {Object.keys(groupedFixtures).length} days
          </span>
        </div>
      }>
        {loading && <Loader label="Loading fixtures" size="large" />}
        {error && <ErrorState title="Could not load fixtures" message="Try refreshing the page" icon="📅" />}
        {!loading && !error && fixtures.length === 0 && (
          <ErrorState title="No fixtures found" message="No matches scheduled for the selected period" icon="🏟️" />
        )}
        {!loading && !error && fixtures.length > 0 && (
          <div className="ab-fixtures-list">
            {Object.entries(groupedFixtures)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, dateFixtures]) => (
                <div key={date} className="ab-fixtures-date-group">
                  <div className="ab-fixtures-date-header ab-sticky">
                    <h3 className="ab-fixtures-date-title">
                      {formatDate(date, date === toISODate() ? 'Today' : undefined)}
                    </h3>
                    <span className="ab-fixtures-date-count">
                      {dateFixtures.length} fixture{dateFixtures.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="ab-fixtures-date-content">
                    {dateFixtures.map((fixture) => (
                      <div key={fixture.fixture?.id} className="ab-fixture-item">
                        <div className="ab-fixture-time">
                          {new Date(fixture.fixture?.date).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </div>
                        <div className="ab-fixture-league">
                          {fixture.league?.name}
                        </div>
                        <div className="ab-fixture-teams">
                          <span className="ab-fixture-team ab-fixture-home">
                            {fixture.teams?.home?.name}
                          </span>
                          <span className="ab-fixture-vs">vs</span>
                          <span className="ab-fixture-team ab-fixture-away">
                            {fixture.teams?.away?.name}
                          </span>
                        </div>
                        <div className="ab-fixture-venue">
                          {fixture.fixture?.venue?.name || 'TBD'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>
    </div>
  );
}


