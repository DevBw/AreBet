import React, { useMemo } from 'react';
import Card from '../components/Card.jsx';
import KPIChip from '../components/KPIChip.jsx';
import Loader from '../components/Loader.jsx';
import { useLiveMatches, useFixturesRange } from '../hooks/useMatches';
import { toISODate, addDays } from '../utils/date';

export default function Trends() {
  const today = toISODate();
  const { data: liveData, loading: liveLoading } = useLiveMatches();
  const { data: recentData, loading: recentLoading } = useFixturesRange(addDays(today, -7), today);
  const { data: upcomingData, loading: upcomingLoading } = useFixturesRange(today, addDays(today, 7));
  
  const trendStats = useMemo(() => {
    const recentMatches = recentData?.response?.filter(m => m.fixture?.status?.short === 'FT') || [];
    const totalMatches = recentMatches.length;
    
    if (totalMatches === 0) return null;
    
    const bttsMatches = recentMatches.filter(m => 
      (m.goals?.home || 0) > 0 && (m.goals?.away || 0) > 0
    ).length;
    
    const overMatches = recentMatches.filter(m => 
      (m.goals?.home || 0) + (m.goals?.away || 0) > 2.5
    ).length;
    
    const homeWins = recentMatches.filter(m => 
      (m.goals?.home || 0) > (m.goals?.away || 0)
    ).length;
    
    return {
      bttsPercentage: Math.round((bttsMatches / totalMatches) * 100),
      overPercentage: Math.round((overMatches / totalMatches) * 100),
      homeAdvantage: Math.round((homeWins / totalMatches) * 100),
      totalMatches,
      avgGoalsPerGame: (recentMatches.reduce((sum, m) => 
        sum + (m.goals?.home || 0) + (m.goals?.away || 0), 0) / totalMatches).toFixed(1)
    };
  }, [recentData]);

  const hotTrends = useMemo(() => [
    {
      title: "Goals Galore Weekend",
      description: "72% of weekend fixtures saw over 2.5 goals",
      trend: "⬆️",
      confidence: "High"
    },
    {
      title: "Home Fortress",
      description: "Premier League home teams winning 65% of matches",
      trend: "⬆️", 
      confidence: "Medium"
    },
    {
      title: "Late Drama",
      description: "45% of goals scored in final 30 minutes",
      trend: "🔥",
      confidence: "High"
    },
    {
      title: "Derby Intensity",
      description: "Local derbies averaging 3.2 cards per game",
      trend: "⚡",
      confidence: "Medium"
    }
  ], []);

  const trackingTargets = [
    { name: "Manchester City", type: "Team", form: "WWWWW", nextMatch: "vs Arsenal" },
    { name: "Erling Haaland", type: "Player", stat: "12 goals in 8 games", team: "Man City" },
    { name: "Premier League", type: "League", stat: "2.8 goals/game", trend: "⬆️" },
    { name: "El Clasico", type: "Event", date: "Next Sunday", impact: "High" }
  ];

  const isLoading = liveLoading || recentLoading || upcomingLoading;

  return (
    <div className="ab-stack">
      <Card title="Trend Overview">
        {isLoading ? (
          <Loader label="Loading trends" />
        ) : trendStats ? (
          <div className="ab-trends-overview">
            <div className="ab-grid-4">
              <KPIChip label="BTTS" value={`${trendStats.bttsPercentage}%`} tone="positive" />
              <KPIChip label="OVER 2.5" value={`${trendStats.overPercentage}%`} tone="warning" />
              <KPIChip label="HOME WIN" value={`${trendStats.homeAdvantage}%`} tone="neutral" />
              <KPIChip label="AVG GOALS" value={trendStats.avgGoalsPerGame} tone="positive" />
            </div>
            <div className="ab-trends-summary">
              Based on {trendStats.totalMatches} matches in the last 7 days
            </div>
          </div>
        ) : (
          <div className="ab-muted">No recent data available for trend analysis</div>
        )}
      </Card>

      <Card title="Hot Trends">
        <div className="ab-trends-grid">
          {hotTrends.map((trend, index) => (
            <div key={index} className="ab-trend-item">
              <div className="ab-trend-header">
                <div className="ab-trend-title">{trend.title}</div>
                <div className="ab-trend-indicator">
                  <span className="ab-trend-icon">{trend.trend}</span>
                  <KPIChip label="CONF" value={trend.confidence} tone={trend.confidence === 'High' ? 'positive' : 'warning'} size="small" />
                </div>
              </div>
              <div className="ab-trend-description">{trend.description}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Tracking Center">
        <div className="ab-tracking-grid">
          {trackingTargets.map((target, index) => (
            <div key={index} className="ab-tracking-item">
              <div className="ab-tracking-header">
                <div className="ab-tracking-name">{target.name}</div>
                <div className="ab-tracking-type">{target.type}</div>
              </div>
              <div className="ab-tracking-detail">
                {target.form && <span className="ab-tracking-form">{target.form}</span>}
                {target.stat && <span className="ab-tracking-stat">{target.stat}</span>}
                {target.nextMatch && <span className="ab-tracking-next">{target.nextMatch}</span>}
                {target.date && <span className="ab-tracking-date">{target.date}</span>}
                {target.trend && <span className="ab-tracking-trend">{target.trend}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Market Insights">
        <div className="ab-market-insights">
          <div className="ab-insight-item">
            <div className="ab-insight-icon">📈</div>
            <div className="ab-insight-content">
              <div className="ab-insight-title">Value Spotting</div>
              <div className="ab-insight-text">
                Underdog wins up 23% this month - look for value in relegation battles
              </div>
            </div>
          </div>
          <div className="ab-insight-item">
            <div className="ab-insight-icon">⏰</div>
            <div className="ab-insight-content">
              <div className="ab-insight-title">Timing Matters</div>
              <div className="ab-insight-text">
                Early kickoffs (12:30) see 15% fewer goals than evening matches
              </div>
            </div>
          </div>
          <div className="ab-insight-item">
            <div className="ab-insight-icon">🌧️</div>
            <div className="ab-insight-content">
              <div className="ab-insight-title">Weather Impact</div>
              <div className="ab-insight-text">
                Rainy conditions correlate with 0.4 fewer goals per game
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


