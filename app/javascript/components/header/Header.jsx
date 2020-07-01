import React from 'react';
import AreaSelect from './AreaSelect';
import Title from './Title';

const Header = ({ areas, selected, setSelected, disabled }) => {
  return (
    <div className="commute-nz__header">
      <Title />
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