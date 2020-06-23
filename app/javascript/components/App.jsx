import React, { useState, useEffect, useMemo } from 'react'
import Header from './header/Header'
import MapPanel from './map/MapPanel'
import DetailsPanel from './details/DetailsPanel'
import { json, csv } from 'd3-request'

const App = () => {
  const [features, setFeatures] = useState([]);
  const [travelToEdu, setTravelToEdu] = useState(null);
  const [selected, setSelected] = useState(null);
  const areas = useMemo(() => features.features ? features.features.reduce(
    (result, feature) => [...result, { id: feature.properties.SA22018_V1, name: feature.properties.SA22018__1 }], []) : [],
    [features]
  );

  const commutes = useMemo(() => (travelToEdu && selected) ? travelToEdu.reduce((result, commute) => {
    const code1 = commute.SA2_code_usual_residence_address;
    const code2 = commute.SA2_code_educational_address;

    if (code1 === selected.id) {
      if (!(code2 in result)) result[code2] = 0;

      result[code2] += parseInt(commute.Total)
    }
    return result;
  }, {}) : [], [selected, travelToEdu])

  console.log(commutes)

  useEffect(() => {
    json("/nz-sa2.json", (error, data) => {
      if(error) throw error
      setFeatures(data);
    })
  }, []);

  useEffect(() => {
    csv("/2018-census-main-means-of-travel-to-education-by-statistical.csv", (error, data) => {
      if(error) throw error
      setTravelToEdu(data);
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
          commutes={commutes}
        />
        <DetailsPanel />
      </div>
    </div>
  )
}

export default App;