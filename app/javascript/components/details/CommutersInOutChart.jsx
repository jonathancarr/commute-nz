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

const CommutersInOutChart = ({ name, commutes, setTooltip }) => {
  const pieRef = useRef(null);
  const keyRef = useRef(null);
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

  const labels = useMemo(() => {
    if (!name) return null;

    return {
      commuteIn: "Commute into " + name,
      commuteOut: "Commute out of " + name,
      local: "Commute within " + name,
    }
  }, [name]);

  useEffect(() => {
    const width = pieRef.current.clientWidth;
    const height = pieRef.current.clientHeight;

    pieGenerator.current = pie()
      .value((d, i) => pieData[KEYS[i]])
      .sort(null);

    const data_ready = pieGenerator.current(KEYS)

    arcGenerator.current = arc()
      .innerRadius(0)
      .outerRadius(RADIUS)

    select(pieRef.current)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .selectAll('pieSlice')
      .data(data_ready)
      .enter()
      .append('path')
        .attr("class", "pieSlice")
        .attr('d', arcGenerator.current)
        .attr('fill', d => COLORS[d.data])
        .attr("stroke", "white")
        .style("stroke-width", "2px")

    select(pieRef.current)
      .append("g")
      .attr("class", "pie-labels")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
      .style("pointer-events", "none")

    select(keyRef.current)
      .append("g")
      .attr("class", "key-squares")
      .selectAll(".legend-squares")
      .data(KEYS)
      .enter()
      .append("rect")
        .attr("class", "legend-squares")
        .attr("x", 10)
        .attr("y", (d, i) => 20 + i * 40)
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("width", 30)
        .attr("height", 30)
        .attr("fill", d => COLORS[d])

    select(keyRef.current)
      .append("g")
      .attr("class", "key-labels")
      .selectAll("legend-labels")
      .data(KEYS)
      .enter()
      .append("text")
        .text(d => labels[d])
        .attr("class", "legend-labels")
        .attr("font-size", 14)
        .attr("x", 50)
        .attr("y", (d, i) => 35 + i * 40)
        .style("alignment-baseline", "central")

    setLoaded(true);
  }, []);

  useEffect(() => {
    select(pieRef.current)
      .select(".pie-labels")
      .selectAll("text")
      .transition()
      .attr("opacity", 0)
      .on("end", function (d) {
        select(this).remove()
      })

    const p = pie()
      .value((d, i) => pieData[KEYS[i]])

    pieGenerator.current = pie()
      .value((d, i) => pieData[KEYS[i]])
      .sort(null)

    const data_ready = pieGenerator.current(KEYS)

    const arcTween = function(a) {
      const i = interpolate(this._current, a);
      this._current = i(0);
      return function(t) {
        return arcGenerator.current(i(t));
      };
    }

    select(keyRef.current)
      .selectAll(".legend-labels")
      .text(d => labels[d])

    select(pieRef.current)
      .selectAll('.pieSlice')
      .data(data_ready)
      .on("mouseover", function (d) {
        setTooltip(
          `${labels[d.data]}: <strong>${d.value}</strong>`,
          event.pageX - 25,
          event.pageY - 20,
        );
      })
      .on("mouseout", function (d) {
        setTooltip(null);
      })
      .transition()
      .duration(500)
      .attrTween("d", arcTween)
      .on("end", function (d, i) {
        select(pieRef.current)
          .select(".pie-labels")
          .append("text")
          .text(d.value)
          .style("text-anchor", "middle")
          .style("alignment-baseline", "central")
          .attr("transform", () => "translate(" + arcGenerator.current.centroid(d) + ")")
          .attr("opacity", 0)
          .style("font-weight", "bold")
          .transition()
          .attr("opacity", () => {
            if (Math.abs(d.startAngle - d.endAngle) > Math.PI / 5){
              return 1;
            } else {
              return 0;
            }
          })
      })

  }, [commutes, loaded, name])

  return (
    <>
      <h1 className="chart-title">{`Commuters of ${name}`}</h1>
      <div className="commuters-chart" >
        <svg className="commuters-chart__key" ref={keyRef} />
        <svg className="commuters-chart__pie" ref={pieRef} />
      </div>
    </>
  )
}

export default CommutersInOutChart;