import React from 'react'
import ModeOfTransportChart from './ModeOfTransportChart';
import DistanceCharts from './DistanceCharts';
import CommutersInOutChart from './CommutersInOutChart';

const DetailsPanel = ({ selected, commutes }) => {
  return (
    <div className="commute-nz__details-panel">
      <div className="commute-nz__details details">
        { selected && (
          <>
            <h1 className="details__name">{selected.name}</h1>
            <CommutersInOutChart
              name={selected.name}
              commutes={commutes}
            />
            <DistanceCharts />
            <ModeOfTransportChart />
          </>
        )}
      </div>
    </div>
  )
}

export default DetailsPanel;