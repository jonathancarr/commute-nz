import React, { useState, useEffect, useMemo, useRef } from 'react'
import Header from './header/Header'
import MapPanel from './map/MapPanel'
import DetailsPanel from './details/DetailsPanel'
import { json, csv } from 'd3-request'
import { feature } from 'topojson-client'
import { useCallback } from 'react'
import { select } from 'd3-selection'
import "@babel/polyfill";

const TRANSPORT_MODES = [
  "Work at home",
  "Study at home",
  "Drive a private car, truck or van",
  "Drive a company car, truck or van",
  "Passenger in a car, truck, van or company bus",
  "Public bus",
  "School bus",
  "Train",
  "Bicycle",
  "Walk or jog",
  "Ferry",
  "Other",
]

const App = () => {
  const [features, setFeatures] = useState(null);
  const [census, setCensus] = useState(null);
  const [selected, setSelected] = useState(null);

  const tooltipRef = useRef(null);

  const loaded = useMemo(() => census && features, [census, features])

  const setTooltip = useCallback((content, x, y) => {
    const tooltip = select(tooltipRef.current);
    if (content) {
      tooltip
        .html(content)
        .style('opacity', 0.95)
        .style('top', `${y}px`)
        .style('left', `${x}px`)
        .style('transform', 'translate(-50%, -50%)')
    } else {
      tooltip.style('opacity', 0);
    }
  });

  const areas = useMemo(() => features ? features.features
    .filter(d => d.properties.LAND_AREA_ > 0)
    .reduce((result, feature) => [...result, {
      id: feature.properties.SA22018_V1,
      name: feature.properties.SA22018__1,
      regionName: feature.properties.REGC2018_1,
      regionId: feature.properties.REGC2018_V,
    }], []).sort((a, b) => {
      if (a.regionId === b.regionId) {
        return a.id.localeCompare(b.id)
      }
      return a.regionId.localeCompare(b.regionId)
    }) : [],
    [features]
  );

  const commutes = useMemo(() => (census && selected) ? census.reduce((result, commute) => {
    const code1 = commute.from;
    const code2 = commute.to;
    if (code1 === selected.id && code2 === selected.id) {
      if (!(code1 in result.local)) result.local[code1] = 0;

      result.local[code1] += parseInt(commute.Total)
    } else if (code1 === selected.id) {
      if (!(code2 in result.outgoing)) result.outgoing[code2] = 0;

      result.outgoing[code2] += parseInt(commute.Total)
    } else if (code2 === selected.id) {
      if (!(code1 in result.incoming)) result.incoming[code1] = 0;

      result.incoming[code1] += parseInt(commute.Total)
    }
    return result;
  }, { incoming: {}, outgoing: {}, local: {}}) : [], [selected, census])

  const topAreas = useMemo(() => {
    if (commutes.length === 0) return;

    return ['incoming', 'outgoing'].reduce((result, direction) => ({
      ...result,
      [direction]: Object.entries(commutes[direction])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key, count]) => ({ name: areas.find((a) => a.id === key).name, count: count }))
    }), {})
  }, [commutes]);

  const transportModes = useMemo(() => {
    if (!census || !selected) return null;

    const res = TRANSPORT_MODES.reduce((result, mode) => ({
      ...result,
      [mode]: {
        incoming: 0,
        outgoing: 0,
        local: 0,
      }
    })
    , {});

    census.forEach((commute) => {
      const code1 = commute.from;
      const code2 = commute.to;
      let direction = null;
      if (code1 === selected.id && code2 === selected.id) {
        direction = 'local';
      } else if (code1 === selected.id) {
        direction = 'outgoing';
      } else if (code2 === selected.id) {
        direction = 'incoming';
      }

      if (!direction) return;

      TRANSPORT_MODES.forEach(mode => {
        res[mode][direction] += parseInt(commute[mode]);
      });
    })

    return res;
  }, [selected, census]);

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
      <div className="commute-nz__tooltip" ref={tooltipRef} >
        oooh boy
      </div>
      <Header
        areas={areas}
        selected={selected}
        setSelected={setSelected}
        disabled={!loaded}
      />
        <div className="commute-nz__content">
        <MapPanel
          features={features}
          areas={areas}
          selected={selected}
          setSelected={setSelected}
          commutes={commutes}
          loading={!loaded}
          setTooltip={setTooltip}
        />
        <DetailsPanel
          selected={selected}
          commutes={commutes}
          transportModes={transportModes}
          topAreas={topAreas}
          loading={!loaded}
          setTooltip={setTooltip}
        />
      </div>
    </div>
  )
}

export default App;