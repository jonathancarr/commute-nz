import React from 'react'
import ModeOfTransportChart from './ModeOfTransportChart';
import DataSources from './DataSources';
import CommutersInOutChart from './CommutersInOutChart';
import Instructions from './Instructions';
import TopAreas from './TopAreas';

const DetailsPanel = ({ selected, commutes, transportModes, topAreas, loading, setTooltip }) => {
  return (
    <div className="commute-nz__details-panel" tabIndex={0}>
      <div className="commute-nz__details details">
        { selected && (
          <>
            <CommutersInOutChart
              name={selected.name}
              commutes={commutes}
              setTooltip={setTooltip}
            />
            <ModeOfTransportChart
              name={selected.name}
              transportModes={transportModes}
              setTooltip={setTooltip}
            />
            <TopAreas
              topAreas={topAreas}
              name={selected.name}
            />
          </>
        )}
        { !selected && <Instructions loading={loading}/> }
        <DataSources />
      </div>
    </div>
  )
}

export default DetailsPanel;