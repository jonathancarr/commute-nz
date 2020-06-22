import React, { useState, useEffect, useMemo } from 'react'
import Header from './header/Header'
import MapPanel from './map/MapPanel'
import DetailsPanel from './details/DetailsPanel'
import { json } from 'd3-request'

const App = () => {
  const [features, setFeatures] = useState([]);
  const [selected, setSelected] = useState(null);
  const areas = useMemo(() => features.features ? features.features.reduce(
    (result, feature) => [...result, { id: feature.properties.SA22018_V1, name: feature.properties.SA22018__1 }], []) : [],
    [features]
  );

  useEffect(() => {
    json("/nz-sa2.json", (error, data) => {
      if(error) throw error
      setFeatures(data);
    })
  }, []);

  return (
    <div className="commute-nz">
      <Header 
        areas={areas}
        selected={selected}
        setSelected={setSelected}
      />
      <div className="commute-nz__content">
        <MapPanel 
          features={features}
          areas={areas}
          selected={selected}
          setSelected={setSelected}
        />
        <DetailsPanel />
      </div>
    </div>
  )
}

export default App;