type OddsData = {
  bookmaker: string;
  home: number;
  draw: number;
  away: number;
};

type OddsComparisonProps = {
  odds: OddsData[];
  homeTeam?: string;
  awayTeam?: string;
};

export function OddsComparison({ odds, homeTeam = "Home", awayTeam = "Away" }: OddsComparisonProps) {
  // Find best odds for each outcome
  const bestHome = Math.max(...odds.map((o) => o.home));
  const bestDraw = Math.max(...odds.map((o) => o.draw));
  const bestAway = Math.max(...odds.map((o) => o.away));

  return (
    <div>
      <table className="odds-comparison">
        <thead>
          <tr>
            <th>Bookmaker</th>
            <th>{homeTeam}</th>
            <th>Draw</th>
            <th>{awayTeam}</th>
          </tr>
        </thead>
        <tbody>
          {odds.map((odd) => (
            <tr key={odd.bookmaker}>
              <td>{odd.bookmaker}</td>
              <td className={odd.home === bestHome ? "odds-best" : ""}>{odd.home.toFixed(2)}</td>
              <td className={odd.draw === bestDraw ? "odds-best" : ""}>{odd.draw.toFixed(2)}</td>
              <td className={odd.away === bestAway ? "odds-best" : ""}>{odd.away.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="chart-caption">
        Best odds highlighted in green. Always compare before placing a bet.
      </p>
    </div>
  );
}
