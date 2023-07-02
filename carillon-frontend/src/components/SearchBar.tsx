import React, { ChangeEvent } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import InputBase from '@mui/material/InputBase'
import { styled } from '@mui/material/styles'

const Search = styled('div')({
  position: 'relative',
})

const SearchIconWrapper = styled('div')({
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const StyledInputBase = styled(InputBase)({
  color: 'inherit',
  position: 'relative',
  paddingLeft: 30,
  width: '100%',
})

interface SearchBarProps {
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function SearchBar({ onChange }: SearchBarProps) {
  return (
    <Search sx={{ borderBottom: 1, borderColor: 'lightgray' }}>
      <SearchIconWrapper>
        <SearchIcon color="disabled" />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search…"
        inputProps={{ 'aria-label': 'search' }}
        onChange={onChange}
      />
    </Search>
  )
}
