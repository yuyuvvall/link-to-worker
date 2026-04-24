import { useRef, useState } from 'react'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage, faUpload } from '@fortawesome/free-solid-svg-icons'
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
  onImageUpload?: (name: string, file: File) => Promise<string>
  onImageUploadError?: (name: string, error: unknown) => void
}

const EditFormField = ({
  name,
  label,
  type,
  value,
  required,
  placeholder,
  onChange,
  onImageUpload,
  onImageUploadError,
}: EditFormFieldProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(name, e.target.value)
  }

  const handlePickFile = () => {
    if (!onImageUpload || isUploading) return
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !onImageUpload) return
    setIsUploading(true)
    try {
      const url = await onImageUpload(name, file)
      onChange(name, url)
    } catch (err) {
      onImageUploadError?.(name, err)
    } finally {
      setIsUploading(false)
    }
  }

  if (type === 'image') {
    const hasImage = !!value
    const canUpload = !!onImageUpload
    const PreviewTag = canUpload ? 'button' : 'div'
    const previewProps = canUpload
      ? { type: 'button' as const, onClick: handlePickFile, disabled: isUploading }
      : {}

    return (
      <div className="edit-form-field edit-form-field--image">
        <div className="edit-form-field__label">
          {label}
          {required && <span className="edit-form-field__required"> *</span>}
        </div>
        <PreviewTag
          className={`edit-form-field__image-preview${canUpload ? ' edit-form-field__image-preview--interactive' : ''}`}
          aria-label={canUpload ? `Upload ${label}` : undefined}
          {...previewProps}
        >
          {hasImage ? (
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
          {canUpload && (
            <div className="edit-form-field__image-overlay">
              {isUploading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <FontAwesomeIcon icon={faUpload} />
                  <span className="edit-form-field__image-overlay-label">
                    {hasImage ? 'Change' : 'Upload'}
                  </span>
                </>
              )}
            </div>
          )}
        </PreviewTag>
        {canUpload && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="edit-form-field__file-input"
            onChange={handleFileSelect}
          />
        )}
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
