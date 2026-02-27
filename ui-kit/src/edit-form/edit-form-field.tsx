import TextField from '@mui/material/TextField'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import './edit-form-field.less'

export type EditFormFieldType = 'text' | 'textarea' | 'image'

export type EditFormFieldProps = {
  name: string
  label: string
  type: EditFormFieldType
  value: string
  required?: boolean
  placeholder?: string
  onChange: (name: string, value: string) => void
}

const EditFormField = ({
  name,
  label,
  type,
  value,
  required,
  placeholder,
  onChange,
}: EditFormFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(name, e.target.value)
  }

  if (type === 'image') {
    return (
      <div className="edit-form-field edit-form-field--image">
        <div className="edit-form-field__image-preview">
          {value ? (
            <img
              className="edit-form-field__image-thumbnail"
              src={value}
              alt={label}
            />
          ) : (
            <div className="edit-form-field__image-placeholder">
              <FontAwesomeIcon icon={faImage} />
            </div>
          )}
        </div>
        <TextField
          className="edit-form-field__input"
          label={label}
          value={value}
          onChange={handleChange}
          required={required}
          placeholder={placeholder ?? 'https://...'}
          size="small"
          fullWidth
        />
      </div>
    )
  }

  return (
    <div className="edit-form-field">
      <TextField
        className="edit-form-field__input"
        label={label}
        value={value}
        onChange={handleChange}
        required={required}
        placeholder={placeholder}
        size="small"
        fullWidth
        multiline={type === 'textarea'}
        rows={type === 'textarea' ? 3 : undefined}
      />
    </div>
  )
}

export default EditFormField
