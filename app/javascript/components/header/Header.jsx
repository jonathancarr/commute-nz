import React from 'react'
import AreaSelect from './AreaSelect';

const Header = ({ areas, selected, setSelected, disabled }) => {
  return (
    <div className="commute-nz__header">
      <AreaSelect
        areas={areas}
        selected={selected}
        setSelected={setSelected}
        disabled={disabled}
      />
    </div>
  )
}

export default Header;