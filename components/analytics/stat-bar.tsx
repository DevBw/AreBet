type StatBarProps = {
  label: string;
  home: number;
  away: number;
  homeLabel?: string;
  awayLabel?: string;
};

export function StatBar({ label, home, away, homeLabel = "Home", awayLabel = "Away" }: StatBarProps) {
  const total = home + away;
  const homePercent = (home / total) * 100;
  const awayPercent = (away / total) * 100;

  return (
    <div className="stat-bar">
      <div className="stat-bar-label">
        <span>{label}</span>
        <span>
          {home} - {away}
        </span>
      </div>
      <div className="stat-bar-visual">
        <div className="stat-bar-home" style={{ width: `${homePercent}%` }} title={`${homeLabel}: ${home}`} />
        <div className="stat-bar-away" style={{ width: `${awayPercent}%` }} title={`${awayLabel}: ${away}`} />
      </div>
    </div>
  );
}
