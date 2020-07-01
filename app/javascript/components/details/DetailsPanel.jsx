import React from 'react'
import ModeOfTransportChart from './ModeOfTransportChart';
import DataSources from './DataSources';
import CommutersInOutChart from './CommutersInOutChart';
import Instructions from './Instructions';

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
        { !selected && <Instructions /> }
        <DataSources />
      </div>
    </div>
  )
}

export default DetailsPanel;