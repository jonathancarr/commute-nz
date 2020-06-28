import React, { useEffect, useRef, useState } from 'react'
import { select, event } from 'd3-selection'
import { geoIdentity, geoPath } from 'd3-geo'
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
import { scaleLinear, scaleLog } from 'd3-scale'

const MapPanel = ({ features, selected, setSelected, commutes }) => {
  const svgRef = useRef(null);

  const zom = useRef(null);
  const path = useRef(null);
  const dimensions = useRef(null);

  useEffect(() => {
    if(!selected) return;

    const svg = select(svgRef.current);
    svg.select(".features").selectAll("path")
      .transition()
      .attr("fill", (d) => d.properties.SA22018_V1 === selected.id ? "#8e44ad" : "#1abc9c")

    svg.select(".commutes").selectAll("path").remove()

    const outgoingPaths = Object.keys(commutes.outgoing).reduce(
      (result, key) => [... result, {to: selected.id, from: key, count: commutes.outgoing[key], direction: 'outgoing' }],
      []
    )

    const incomingPaths = Object.keys(commutes.incoming).reduce(
      (result, key) => [... result, {to: key, from: selected.id, count: commutes.incoming[key], direction: 'incoming' }],
      []
    )

    const commutePaths = [...outgoingPaths, ...incomingPaths]

    console.log(commutePaths)

    const d = svg.selectAll(`#path-${selected.id}`).data()[0]

    const [x, y] = path.current.centroid(d);
    const bounds = path.current.bounds(d);

    const commuteWidthScale = scaleLinear()
      .domain([0, 750])
      .range([0.05, 0.25]);

    svg.select(".commutes")
      .selectAll("path")
      .data(commutePaths)
      .enter()
      .append("path")
      .attr("stroke", d => console.log(d.direction) || d.direction == "outgoing" ? "#2980b9" : "#E74C3C")
      .attr("id", d => `commute-${d.from}-${d.to}`)
      .attr("opacity", 0.75)
      .attr("fill", "none")
      .attr("stroke-width", d => commuteWidthScale(d.count))
      .attr("stroke-linecap", "round")
      .attr("d", d => {
        const source = svg.selectAll(`#path-${d.from}`).data()[0];
        const [sourceX, sourceY] = path.current.centroid(source);
        const target = svg.selectAll(`#path-${d.to}`).data()[0];
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
      const b = path.current.bounds(svg.selectAll(`#path-${commute.direction == "outgoing" ? commute.from : commute.to}`).data()[0]);
      minX = Math.min(minX, b[0][0])
      minY = Math.min(minY, b[0][1])
      maxX = Math.max(maxX, b[1][0])
      maxY = Math.max(maxY, b[1][1])
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
    if (features.length === 0) return;

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
      svg.selectAll('path') // To prevent stroke width from scaling
        .attr('transform', event.transform)

      svg.select(".features").selectAll("path")
      .attr("stroke-width", lineScale(event.transform.k))
    }

    const lineScale = scaleLog()
      .domain([1, 500])
      .range([0.1, 0.001])

    zom.current = zoom()
      .scaleExtent([1, 500])
      .translateExtent([[- width / 2, - height / 2], [1.5 * width, 1.5 *  height]])
      .on('zoom', zoomed);

   svg.append("g")
      .attr("class", "features")
      .selectAll("path")
      .data(features.features)
      .enter()
      .append("path")
        .attr("d", path.current)
        .attr("id", (d) => `path-${d.properties.SA22018_V1}`)
        .attr("fill", "#1abc9c")
        .attr("stroke-width", "0.1px")
        .attr("stroke", (d) => "#FFFFFF")
        .on("click", (d) => setSelected({ name: d.properties.SA22018__1, id: d.properties.SA22018_V1}))

    svg.append("g")
      .attr("class", "commutes");

    svg.call(zom.current)

  }, [features])

  return (
    <div className="commute-nz__map-panel">
        <svg className="commute-nz__map" ref={svgRef}/>
    </div>
  )
}

export default MapPanel;