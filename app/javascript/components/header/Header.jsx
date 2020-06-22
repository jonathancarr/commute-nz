import React from 'react'
import AreaSelect from './AreaSelect';

const Header = ({ areas, selected, setSelected }) => {
  return (
    <div className="commute-nz__header">
      <AreaSelect
        areas={areas}
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  )
}

export default Header;