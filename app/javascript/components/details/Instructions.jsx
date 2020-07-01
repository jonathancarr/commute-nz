import React from 'react'

const Instructions = ({ loading }) => (
  <div className="instructions">
    { !loading && (
      <>
        <p className="instructions__header">Select an area</p>
        <p className="instructions__text">Use the dropdown above or click on the map</p>
      </>
    )}
  </div>
)

export default Instructions;