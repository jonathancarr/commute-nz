import React from 'react'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'

const AreaSelect = ({ areas, selected, setSelected, disabled }) => {
  return (
    <Autocomplete
      className="commute-nz__district-select"
      options={areas}
      getOptionLabel={(option) => option.name}
      disabled={disabled}
      groupBy={(option) => option.regionName}
      value={selected}
      onChange={(event, newValue) => setSelected(newValue)}
      renderInput={(params) => <TextField {...params} label="Area" variant="outlined" />}
    />
  )
}

export default AreaSelect;