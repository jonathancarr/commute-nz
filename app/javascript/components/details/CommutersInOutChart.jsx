import React from 'react'
import { useRef, useEffect, useMemo } from 'react';
import { select } from 'd3-selection';
import { pie, arc } from 'd3-shape';
import { interpolate } from 'd3-interpolate';
import { useState } from 'react';

const RADIUS = 75;

const DEFAULT = {
  commuteIn: 0,
  commuteOut: 0,
  local: 0,
}

const COLORS = {
  commuteIn: "#e74c3c",
  commuteOut: "#2980b9",
  local: "#9b59b6",
}

const KEYS = ['commuteIn', 'commuteOut', 'local'];

const CommutersInOutChart = ({ name, commutes }) => {
  const svgRef = useRef(null);
  const pieGenerator = useRef(null);
  const arcGenerator = useRef(null);

  const [loaded, setLoaded] = useState(false);

  const sum = (obj) => Object.values(obj).reduce((res, num) => res + num, 0);

  const pieData = useMemo(() => {
    if (!loaded || !commutes) return DEFAULT;

    return {
      commuteIn: sum(commutes.incoming),
      commuteOut: sum(commutes.outgoing),
      local: sum(commutes.local),
    }
  }, [commutes, loaded])

  console.log(pieData);

  useEffect(() => {
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    pieGenerator.current = pie()
      .value((d, i) => console.log(pieData) || pieData[KEYS[i]])
      .sort(null);

    const data_ready = pieGenerator.current(KEYS)

    console.log(data_ready)

    arcGenerator.current = arc()
      .innerRadius(0)
      .outerRadius(RADIUS)

    select(svgRef.current)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .selectAll('pieSlice')
      .data(data_ready)
      .enter()
      .append('path')
        .attr("class", "pieSlice")
        .attr('d', arcGenerator.current)
        .attr('fill', d => console.log(d) || COLORS[d.data])
        .attr("stroke", "white")
        .style("stroke-width", "2px")
    setLoaded(true);
  }, []);

  useEffect(() => {
    const p = pie()
      .value((d, i) => console.log(i) || pieData[KEYS[i]])

    pieGenerator.current = pie()
      .value((d, i) => console.log(pieData) || pieData[KEYS[i]])
      .sort(null)

    const data_ready = pieGenerator.current(KEYS)

    console.log(data_ready)
    console.log(pieData)

    const arcTween = function(a) {
      const i = interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arcGenerator.current(i(t));
      };
    }

    select(svgRef.current)
      .selectAll('.pieSlice')
      .data(data_ready)
      .transition()
      .duration(500)
      .attrTween("d", arcTween)

  }, [commutes, loaded])

  return (
    <svg className="commuters-chart" ref={svgRef} />
  )
}

export default CommutersInOutChart;