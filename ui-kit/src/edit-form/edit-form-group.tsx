import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import EditFormField from './edit-form-field'
import type { EditFormFieldType } from './edit-form-field'
import './edit-form-group.less'

export type EditFormGroupFieldEntry = {
  name: string
  label: string
  type: EditFormFieldType
  value: string
  required?: boolean
  placeholder?: string
}

export type EditFormGroupProps = {
  name: string
  label: string
  fields: EditFormGroupFieldEntry[][]
  maxItems?: number
  onFieldChange: (groupName: string, index: number, fieldName: string, value: string) => void
  onItemAdd: (groupName: string) => void
  onItemRemove: (groupName: string, index: number) => void
  onImageUpload?: (groupName: string, index: number, fieldName: string, file: File) => Promise<string>
  onImageUploadError?: (groupName: string, index: number, fieldName: string, error: unknown) => void
}

const EditFormGroup = ({
  name,
  label,
  fields,
  maxItems,
  onFieldChange,
  onItemAdd,
  onItemRemove,
  onImageUpload,
  onImageUploadError,
}: EditFormGroupProps) => {
  const canAdd = maxItems === undefined || fields.length < maxItems

  return (
    <div className="edit-form-group">
      <Typography className="edit-form-group__label" variant="subtitle2" fontWeight="bold">
        {label}
      </Typography>
      <div className="edit-form-group__items">
        {fields.map((group, index) => (
          <div className="edit-form-group__item" key={index}>
            <div className="edit-form-group__item-fields">
              {group.map((field) => (
                <EditFormField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  type={field.type}
                  value={field.value}
                  required={field.required}
                  placeholder={field.placeholder}
                  onChange={(_fieldName, value) => onFieldChange(name, index, field.name, value)}
                  onImageUpload={
                    onImageUpload
                      ? (_fieldName, file) => onImageUpload(name, index, field.name, file)
                      : undefined
                  }
                  onImageUploadError={
                    onImageUploadError
                      ? (_fieldName, error) => onImageUploadError(name, index, field.name, error)
                      : undefined
                  }
                />
              ))}
            </div>
            <IconButton
              className="edit-form-group__remove-button"
              onClick={() => onItemRemove(name, index)}
              aria-label={`Remove ${label} item`}
              size="small"
            >
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>
          </div>
        ))}
      </div>
      {canAdd && (
        <Button
          className="edit-form-group__add-button"
          onClick={() => onItemAdd(name)}
          startIcon={<FontAwesomeIcon icon={faPlus} />}
          size="small"
        >
          Add {label}
        </Button>
      )}
    </div>
  )
}

export default EditFormGroup
