import React, { useMemo } from 'react';
import { useLiveMatches, useFixturesRange } from '../hooks/useMatches';
import { toISODate, addDays } from '../utils/date';

export function FormTrendsChart() {
  const { data: liveData } = useLiveMatches();
  const today = toISODate();
  const { data: fixturesData } = useFixturesRange(addDays(today, -7), today);
  
  const chartData = useMemo(() => {
    const matches = fixturesData?.response || [];
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = addDays(today, -i);
      const dayMatches = matches.filter(m => 
        m.fixture?.date?.startsWith(date)
      );
      last7Days.push({
        day: new Date(date).toLocaleDateString('en', { weekday: 'short' }),
        matches: dayMatches.length,
        goals: dayMatches.reduce((sum, m) => sum + (m.goals?.home || 0) + (m.goals?.away || 0), 0)
      });
    }
    
    return last7Days;
  }, [fixturesData, today]);

  const maxMatches = Math.max(...chartData.map(d => d.matches));
  const maxGoals = Math.max(...chartData.map(d => d.goals));

  return (
    <div className="ab-mini-chart">
      <div className="ab-chart-title">Weekly Match Activity</div>
      <div className="ab-mini-chart-container">
        <div className="ab-mini-chart-bars">
          {chartData.map((day, index) => (
            <div key={index} className="ab-mini-chart-day">
              <div 
                className="ab-mini-chart-bar ab-mini-chart-matches"
                style={{ height: `${(day.matches / maxMatches) * 100}%` }}
                title={`${day.matches} matches`}
              />
              <div 
                className="ab-mini-chart-bar ab-mini-chart-goals"
                style={{ height: `${(day.goals / maxGoals) * 60}%` }}
                title={`${day.goals} goals`}
              />
              <span className="ab-mini-chart-label">{day.day}</span>
            </div>
          ))}
        </div>
        <div className="ab-mini-chart-legend">
          <div className="ab-mini-chart-legend-item">
            <div className="ab-mini-chart-legend-color ab-mini-chart-matches"></div>
            <span>Matches</span>
          </div>
          <div className="ab-mini-chart-legend-item">
            <div className="ab-mini-chart-legend-color ab-mini-chart-goals"></div>
            <span>Goals</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VenueAnalysisChart() {
  const { data: fixturesData } = useFixturesRange(addDays(toISODate(), -30), toISODate());
  
  const venueStats = useMemo(() => {
    const matches = fixturesData?.response?.filter(m => 
      m.fixture?.status?.short === 'FT' && 
      m.goals?.home !== null && 
      m.goals?.away !== null
    ) || [];
    
    const homeWins = matches.filter(m => m.goals.home > m.goals.away).length;
    const draws = matches.filter(m => m.goals.home === m.goals.away).length;
    const awayWins = matches.filter(m => m.goals.home < m.goals.away).length;
    const total = matches.length;
    
    return {
      homeWins: total > 0 ? Math.round((homeWins / total) * 100) : 0,
      draws: total > 0 ? Math.round((draws / total) * 100) : 0,
      awayWins: total > 0 ? Math.round((awayWins / total) * 100) : 0,
      total
    };
  }, [fixturesData]);

  return (
    <div className="ab-venue-analysis">
      <div className="ab-venue-breakdown">
        <div className="ab-venue-segment ab-venue-home" 
             style={{ width: `${venueStats.homeWins}%` }}
             title={`Home wins: ${venueStats.homeWins}%`}>
        </div>
        <div className="ab-venue-segment ab-venue-draw" 
             style={{ width: `${venueStats.draws}%` }}
             title={`Draws: ${venueStats.draws}%`}>
        </div>
        <div className="ab-venue-segment ab-venue-away" 
             style={{ width: `${venueStats.awayWins}%` }}
             title={`Away wins: ${venueStats.awayWins}%`}>
        </div>
      </div>
      <div className="ab-venue-labels">
        <span className="ab-venue-label">
          <span className="ab-venue-dot ab-venue-home"></span>
          Home {venueStats.homeWins}%
        </span>
        <span className="ab-venue-label">
          <span className="ab-venue-dot ab-venue-draw"></span>
          Draw {venueStats.draws}%
        </span>
        <span className="ab-venue-label">
          <span className="ab-venue-dot ab-venue-away"></span>
          Away {venueStats.awayWins}%
        </span>
      </div>
      <div className="ab-venue-total">
        Based on {venueStats.total} recent matches
      </div>
    </div>
  );
}
