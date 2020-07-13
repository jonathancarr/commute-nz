import React from 'react'
import { useRef, useEffect, useState } from 'react';
import { select, event } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { useMemo } from 'react';

const KEY_LABELS = {
  "Work at home": "Work at home",
  "Study at home": "Study at home",
  "Drive a private car, truck or van": "Drive a private vehicle",
  "Drive a company car, truck or van": "Drive a company vehicle",
  "Passenger in a car, truck, van or company bus": "Passenger in a vehicle",
  "Public bus": "Public bus",
  "School bus": "School bus",
  "Train": "Train",
  "Bicycle": "Bicycle",
  "Walk or jog": "Walk or jog",
  "Ferry": "Ferry",
  "Other": "Other",
}

const COLORS = {
  incoming: "#e74c3c",
  outgoing: "#2980b9",
  local: "#9b59b6",
}

const ModeOfTransportChart = ({ transportModes, name, setTooltip }) => {
  const svgRef = useRef(null);
  const values = useRef([]);
  const textWidth = useRef(0);
  const xOffsets = useRef(null);

  const [loaded, setLoaded] = useState(false);

  const tooltipSuffixes = useMemo(() => ({
    incoming: `into ${name}`,
    outgoing: `out of ${name}`,
    local: `within ${name}`,
  }), [name]);

  useEffect(() => {
    const svg = select(svgRef.current);
    const width = svgRef.current.clientWidth;

    svg.append("g")
      .attr("class", "yLabels")
      .selectAll(".label")
      .data(Object.keys(transportModes))
      .enter()
      .append("text")
      .attr("class", "label")
      .text(d => KEY_LABELS[d]  )
      .attr("x", 10)
      .attr("font-size", 14)
      .attr("y", (d, i) => 10 + 30 * i)

    svg.selectAll(".label")
      .each(function(d) {
        textWidth.current = Math.max(this.getComputedTextLength(), textWidth.current)
      });

    svg.selectAll(".label")
      .attr("x", 5 + textWidth.current)
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "central")

    Object.keys(transportModes).forEach((mode, modeIndex) => {
      Object.keys(transportModes[mode]).forEach((direction, directionIndex) => {
        values.current.push({ mode, direction, modeIndex, directionIndex });
      })
    });

    svg.append("g")
      .attr("class", "bars")
      .selectAll(".bar")
      .data(values.current)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("fill", d => COLORS[d.direction])
      .attr("x", textWidth.current + 10)
      .attr("y", d => 30 * d.modeIndex)
      .attr("width", 0)
      .attr("height", 20)
      .attr("stroke", "white")
      .on("mouseover", d => {
        setTooltip(
          `${d.mode} ${tooltipSuffixes[d.direction]}: <strong>${transportModes[d.mode][d.direction]}</strong>`,
          event.pageX,
          event.pageY - 25,
        )
      })
      .on("mouseout", d => setTooltip(null))

    svg.append("g").attr("class", "axis")

    setLoaded(true);
  }, []);

  useEffect(() => {
    let maxRowVal = 0;

    const svg = select(svgRef.current);

    Object.keys(transportModes).forEach((mode, modeIndex) => {
      let count = 0;
      Object.keys(transportModes[mode]).forEach((direction, directionIndex) => {
        count += transportModes[mode][direction]
      })
      maxRowVal = Math.max(maxRowVal, count);
    });

    const width = svgRef.current.clientWidth;
    const barX = textWidth.current + 10;
    const barScale = scaleLinear()
      .domain([0, maxRowVal + 1])
      .range([0, width - barX - 10])

    var axis = axisBottom().ticks(5).scale(barScale);

    svg.select(".axis")
      .attr("transform", "translate(" + barX + "," + 30 * Object.keys(transportModes).length + ")")
      .transition()
      .call(axis)

    xOffsets.current = Object.keys(transportModes).reduce((result, mode) => ({
      ...result,
      [mode]: barX,
    }), {});

    svg.select(".bars")
      .selectAll(".bar")
      .each(function() {
        select(this)
          .transition()
          .attr("x", d => {
            return xOffsets.current[d.mode]
          })
          .attr("width", d => {
            const w = barScale(transportModes[d.mode][d.direction])
            xOffsets.current[d.mode] += w;
            return w;
          })
      })
  }, [loaded, transportModes])

  return (
    <>
      <h2 className="chart-title">{`Transport used by ${name} commuters`}</h2>
      <svg className="transport-modes-chart" ref={svgRef} />
    </>
  )
}

export default ModeOfTransportChart;