import React from 'react'
import { useRef, useEffect, useState } from 'react';
import { select, event } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { useMemo } from 'react';

const COLORS = {
  incoming: "#e74c3c",
  outgoing: "#2980b9",
  local: "#9b59b6",
}

const TopAreas = ({ topAreas, name }) => (
  <div className="top-areas">
    { topAreas.outgoing.length > 0 && (
      <>
        <h1 className="top-areas__title">Areas with the most commuters from {name}</h1>
        { topAreas.outgoing.map((area, index) => (
          <div className="top-area">
            <div className="top-area__index top-area__index-outgoing">{index + 1}</div>
            <div className="top-area__details">
              <span className="top-area__name">{area.name}:</span>
              <span className="top-area__count">{area.count} commuters</span>
            </div>
          </div>
        ))}
      </>
    )}
    { topAreas.incoming.length > 0 && (
      <>
        <h1 className="top-areas__title">Areas with the most commuters to {name}</h1>
        { topAreas.incoming.map((area, index) => (
          <div className="top-area">
            <div className="top-area__index top-area__index-incoming">{index + 1}</div>
            <div className="top-area__details">
              <span className="top-area__name">{area.name}:</span>
              <span className="top-area__count">{area.count} commuters</span>
            </div>
          </div>
        ))}
      </>
    )}
  </div>
)

export default TopAreas;