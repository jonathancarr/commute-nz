import React, { useState, useEffect, useMemo } from 'react'
import Header from './header/Header'
import MapPanel from './map/MapPanel'
import DetailsPanel from './details/DetailsPanel'
import { json, csv } from 'd3-request'
import { feature } from 'topojson-client'

const App = () => {
  const [features, setFeatures] = useState(null);
  const [census, setCensus] = useState(null);
  const [selected, setSelected] = useState(null);
  const areas = useMemo(() => features ? features.features.reduce(
    (result, feature) => [...result, { id: feature.properties.SA22018_V1, name: feature.properties.SA22018__1 }], []) : [],
    [features]
  );

  const commutes = useMemo(() => (census && selected) ? census.reduce((result, commute) => {
    const code1 = commute.from;
    const code2 = commute.to;

    if (code1 === selected.id) {
      if (!(code2 in result.outgoing)) result.outgoing[code2] = 0;

      result.outgoing[code2] += parseInt(commute.Total)
    }
    if (code2 === selected.id) {
      if (!(code1 in result.incoming)) result.incoming[code1] = 0;

      result.incoming[code1] += parseInt(commute.Total)
    }
    return result;
  }, { incoming: {}, outgoing: {}}) : [], [selected, census])


  useEffect(() => {
    json("/nz-sa2-topo.json", (error, data) => {
      if(error) throw error;
      setFeatures(feature(data, data.objects['nz-sa2']));
    })
  }, []);

  useEffect(() => {
    csv("/2018_census.csv", (error, data) => {
      if(error) throw error
      setCensus(data);
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
          features  ={features}
          areas={areas}
          selected={selected}
          setSelected={setSelected}
          commutes={commutes}
        />
        <DetailsPanel
          selected={selected}
        />
      </div>
    </div>
  )
}

export default App;