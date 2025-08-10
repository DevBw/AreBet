import React from 'react';
import Card from '../components/Card.jsx';
import KPIChip from '../components/KPIChip.jsx';

export default function Predictions() {
  return (
    <div className="ab-stack">
      <Card title="Win/Draw/Win">
        <div className="ab-row">
          <KPIChip label="HOME" value="--%" tone="positive" />
          <KPIChip label="DRAW" value="--%" tone="neutral" />
          <KPIChip label="AWAY" value="--%" tone="warning" />
        </div>
      </Card>
      <Card title="Advice">
        <div className="ab-placeholder">Data-driven advice here.</div>
      </Card>
      <Card title="Predicted Scores">
        <div className="ab-placeholder">e.g. 2 - 1</div>
      </Card>
    </div>
  );
}


