import React, { useEffect, useRef, useState } from 'react'
import { select, event } from 'd3-selection'
import { geoIdentity, geoPath } from 'd3-geo'
import { zoom, zoomIdentity, zoomTransform } from 'd3-zoom'
import { scaleLog } from 'd3-scale'

const MapPanel = ({ features, areas, selected, setSelected }) => {
  const svgRef = useRef(null);

  const zom = useRef(null);
  const path = useRef(null);
  const dimensions = useRef(null);

  useEffect(() => {
    if(!selected) return;
  
    const svg = select(svgRef.current);
    const d = svg.selectAll(`#path-${selected.id}`).data()[0]



    const [x, y] = path.current.centroid(d);
    const bounds = path.current.bounds(d);

    console.log(bounds)
    const pathw = bounds[1][0] - bounds[0][0];
    const pathh = bounds[1][1] - bounds[0][1];

    const kx = dimensions.current[0]/pathw;
    const ky = dimensions.current[1]/pathh;
    
    const k = Math.min(0.9 * Math.min(kx, ky), 500)
  
    console.log(zoomIdentity.translate(dimensions.current[0]/2, dimensions.current[0]/2).scale(k).translate(-x, -y))

    svg.transition().duration(5000).call(
      zom.current.transform,
      zoomIdentity.translate(dimensions.current[0]/2, dimensions.current[0]/2).scale(k).translate(-x, -y),
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
      .fitExtent([ [margin, margin], [width - margin * 2, height - margin * 2]], features)

    path.current = geoPath()
      .projection(projection);

    const zoomed = (a) => {
      svg.select(".features")
        .selectAll('path') // To prevent stroke width from scaling
        .attr('transform', event.transform)
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
      
    svg.call(zom.current)

  }, [features])

  return (
    <div className="commute-nz__map-panel">
        <svg className="commute-nz__map" ref={svgRef}/>
    </div>
  )
}

export default MapPanel;