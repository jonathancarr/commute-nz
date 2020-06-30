import React from 'react'
import ModeOfTransportChart from './ModeOfTransportChart';
import DistanceCharts from './DistanceCharts';
import CommutersInOutChart from './CommutersInOutChart';

const DetailsPanel = ({ selected, commutes, transportModes }) => {
  return (
    <div className="commute-nz__details-panel">
      <div className="commute-nz__details details">
        { selected && (
          <>
            <CommutersInOutChart
              name={selected.name}
              commutes={commutes}
            />
            <ModeOfTransportChart
              name={selected.name}
              transportModes={transportModes}
            />
          </>
        )}
        <DistanceCharts />
      </div>
    </div>
  )
}

export default DetailsPanel;