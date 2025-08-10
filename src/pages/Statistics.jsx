import React from 'react';
import Card from '../components/Card.jsx';

export default function Statistics() {
  return (
    <div className="ab-stack">
      <Card title="Top Players">
        <ul className="ab-list">
          <li>Top Scorers</li>
          <li>Top Assists</li>
          <li>Clean Sheets</li>
        </ul>
      </Card>
      <Card title="Stat Categories">
        <div className="ab-grid-3">
          <div className="ab-tile">Shots</div>
          <div className="ab-tile">xG</div>
          <div className="ab-tile">Possession</div>
        </div>
      </Card>
    </div>
  );
}


