import { type FormEvent } from 'react'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import './search-bar.less'

export type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
}

const SearchBar = ({ value, onChange, onSubmit, isLoading = false }: SearchBarProps) => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!value.trim()) return
    onSubmit()
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <TextField
        className="search-bar__input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search..."
        disabled={isLoading}
        size="small"
      />
      <IconButton
        className="search-bar__button"
        type="submit"
        disabled={isLoading || !value.trim()}
      >
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </IconButton>
    </form>
  )
}

export default SearchBar
