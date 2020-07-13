import React, { useEffect, useRef, useState } from 'react'
import { select, event } from 'd3-selection'
import { geoIdentity, geoPath } from 'd3-geo'
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
import { scaleLinear, scaleLog } from 'd3-scale'

const MAP_HIGHLIGHT = "#f1ccff";
const MAP_HIGHLIGHT_SELECTED = "#d89fed";
const MAP_FILL = "#ecf0f1";
const MAP_FILL_SELECTED = "#e0e0e0";
const STROKE = "#555555"
const SELECTED_STROKE = "#9b59b6"

const MapPanel = ({ features, selected, setSelected, commutes, loading, setTooltip }) => {
  const svgRef = useRef(null);

  const zom = useRef(null);
  const path = useRef(null);
  const dimensions = useRef(null);

  const selectedRef = useRef(null);

  useEffect(() => {
    selectedRef.current = selected;
    select(svgRef.current).select(".commutes").selectAll("path").remove()

    if (!selected) return;

    const svg = select(svgRef.current);
    svg.select(".features").selectAll("path")
      .transition()
      .attr("fill", (d) => d.properties.SA22018_V1 === selected.id ? MAP_HIGHLIGHT : MAP_FILL)
      .attr("stroke", (d) => d.properties.SA22018_V1 === selected.id ? SELECTED_STROKE : STROKE)

    // Move selected to front
    const selectedPath = svg.select(`#path-${selected.id}`).node()
    console.log(selectedPath);
    selectedPath.parentNode.appendChild(selectedPath);

    const outgoingPaths = Object.keys(commutes.outgoing).reduce(
      (result, key) => [... result, {to: selected.id, from: key, count: commutes.outgoing[key], direction: 'outgoing' }],
      []
    )

    const incomingPaths = Object.keys(commutes.incoming).reduce(
      (result, key) => [... result, {to: key, from: selected.id, count: commutes.incoming[key], direction: 'incoming' }],
      []
    )

    const commutePaths = [...outgoingPaths, ...incomingPaths]

    const d = svg.selectAll(`#path-${selected.id}`).data()[0]

    const [x, y] = path.current.centroid(d);
    const bounds = path.current.bounds(d);

    const commuteWidthScale = scaleLinear()
      .domain([0, 750])
      .range([0.03, 0.5]);

    svg.select(".commutes")
      .selectAll("path")
      .data(commutePaths)
      .enter()
      .append("path")
      .attr("stroke", d => d.direction == "outgoing" ? "#2980b9" : "#e74c3c")
      .attr("id", d => `commute-${d.from}-${d.to}`)
      .attr("opacity", 0.75)
      .attr("fill", "none")
      .attr("pointer-events", "none")
      .attr("stroke-width", d =>commuteWidthScale(d.count))
      .attr("stroke-linecap", "round")
      .attr("d", d => {
        const source = svg.selectAll(`#path-${d.from}`).data()[0];
        if (!source) return;
        const [sourceX, sourceY] = path.current.centroid(source);
        const target = svg.selectAll(`#path-${d.to}`).data()[0];
        if(!target) return;
        const [targetX, targetY] = path.current.centroid(target);
        const dx = targetX - sourceX
        const dy = targetY - sourceY
        const dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + sourceX + "," + sourceY + "A" + dr + "," + dr + " 0 0,1 " + targetX + "," + targetY;
      });

    commutePaths.forEach((d) => {
      const ele = svg.select(".commutes").select(`#commute-${d.from}-${d.to}`)
      const length = ele.node().getTotalLength();
      ele.attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", -length)
      ele.transition().delay(1000).duration(2000).attr("stroke-dashoffset", 0)
    })

    let minX = bounds[0][0], minY = bounds[0][1], maxX = bounds[1][0], maxY = bounds[1][1];

    commutePaths.forEach((commute) => {
      const [cx, cy] = path.current.centroid(svg.selectAll(`#path-${commute.direction == "outgoing" ? commute.from : commute.to}`).data()[0]);
      if (!cx || !cy) return;
      minX = Math.min(minX, cx)
      minY = Math.min(minY, cy)
      maxX = Math.max(maxX, cx)
      maxY = Math.max(maxY, cy)
    });

    const pathw = maxX - minX;
    const pathh = maxY - minY;
    const kx = dimensions.current[0]/pathw;
    const ky = dimensions.current[1]/pathh;

    const k = Math.min(0.9 * Math.min(kx, ky), 500)
    const xTranslate = - (minX + maxX) / 2
    const yTranslate = - (minY + maxY) / 2

    svg.transition().duration(2000).call(
      zom.current.transform,
      zoomIdentity.translate(dimensions.current[0]/2, dimensions.current[1]/2).scale(k).translate(xTranslate, yTranslate),
    )
  }, [selected]);

  useEffect(() => {
    if (!features) return;

    dimensions.current = [svgRef.current.clientWidth, svgRef.current.clientHeight];
    const [width, height] = dimensions.current;

    const margin = 20;

    const svg = select(svgRef.current)

    const projection = geoIdentity()
      .reflectY(true)
      .fitExtent([ [0, 0], [width, height]], features)

    path.current = geoPath()
      .projection(projection);

    const zoomed = (a) => {
      svg.select('.map')
        .attr('transform', event.transform)
    }

    const lineScale = scaleLog()
      .domain([1, 500])
      .range([0.1, 0.001])

    zom.current = zoom()
      .scaleExtent([1, 500])
      .translateExtent([[- width / 2, - height / 2], [1.5 * width, 1.5 *  height]])
      .on('zoom', zoomed);

   svg.append("g")
      .attr("class", "map")
      .append("g")
      .attr("class", "features")
      .selectAll("path")
      .data(features.features.filter(d => d.properties.LAND_AREA_ > 0))
      .enter()
      .append("path")
        .attr("d", path.current)
        .attr("id", (d) => `path-${d.properties.SA22018_V1}`)
        .attr("fill", MAP_FILL)
        .attr("stroke-width", 0.02)
        .attr("stroke", d => STROKE)
        .style("cursor", d => d.properties.LAND_AREA_ === 0 ? "default" : "pointer")
        .on("mouseover", function (d) {
          const title = d.properties.SA22018__1;
          setTooltip(`<strong>${title}</strong>`, event.pageX, event.pageY - 20);
          if (selectedRef.current && selectedRef.current.id == d.properties.SA22018_V1) {
            select(this).transition().attr("fill", MAP_HIGHLIGHT_SELECTED);
          } else {
            select(this).transition().attr("fill", MAP_FILL_SELECTED)
          }
        })
        .on("mouseout", function (d) {
          setTooltip(null);
          if (selectedRef.current && selectedRef.current.id == d.properties.SA22018_V1) {
            select(this).transition().attr("fill", MAP_HIGHLIGHT);
          } else {
            select(this).transition().attr("fill", MAP_FILL);
          }
        })
        .on("click", (d) => {
          if (selectedRef.current && d.properties.SA22018_V1 === selectedRef.current.id) {
            setSelected(null)
          } else {
            setSelected({ name: d.properties.SA22018__1, id: d.properties.SA22018_V1})
          }
        });

    svg.select(".map")
      .append("g")
      .attr("class", "commutes");

    svg.call(zom.current)

  }, [loading])

  return (
    <div className="commute-nz__map-panel">
        <svg className="commute-nz__map" ref={svgRef}>
          { loading && (
            <text className="commute-nz__map-loading" x="50%" y="50%">
              Loading...
            </text>
          )}
        </svg>
    </div>
  )
}

export default MapPanel;