import React from 'react';
import Card from '../components/Card.jsx';

export default function Trends() {
  return (
    <div className="ab-stack">
      <Card title="Overview">
        <div className="ab-placeholder">Form trends, over/under, BTTS.</div>
      </Card>
      <Card title="Alerts">
        <div className="ab-placeholder">Your saved alerts will show here.</div>
      </Card>
      <Card title="Tracking">
        <div className="ab-placeholder">Track teams, leagues, players.</div>
      </Card>
      <Card title="Insights">
        <div className="ab-placeholder">Contextual insights appear here.</div>
      </Card>
    </div>
  );
}


