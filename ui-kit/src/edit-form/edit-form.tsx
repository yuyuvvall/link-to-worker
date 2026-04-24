import EditFormLayout from './edit-form-layout'
import EditFormField from './edit-form-field'
import EditFormGroup from './edit-form-group'
import EditFormActions from './edit-form-actions'
import type { EditFormFieldType } from './edit-form-field'
import type { EditFormGroupFieldEntry } from './edit-form-group'

export type { EditFormFieldType }

export type EditFormField = {
  name: string
  label: string
  type: EditFormFieldType
  value: string
  required?: boolean
  placeholder?: string
}

export type EditFormGroupField = {
  name: string
  label: string
  type: 'group-list'
  fields: EditFormGroupFieldEntry[][]
  maxItems?: number
}

export type EditFormEntry = EditFormField | EditFormGroupField

export type EditFormProps = {
  title: string
  fields: EditFormEntry[]
  onFieldChange: (name: string, value: string) => void
  onGroupFieldChange: (groupName: string, index: number, fieldName: string, value: string) => void
  onGroupItemAdd: (groupName: string) => void
  onGroupItemRemove: (groupName: string, index: number) => void
  onSubmit: () => void
  onCancel: () => void
  submitLabel?: string
  cancelLabel?: string
  beforeActions?: React.ReactNode
  onImageUpload?: (name: string, file: File) => Promise<string>
  onGroupImageUpload?: (groupName: string, index: number, fieldName: string, file: File) => Promise<string>
  onImageUploadError?: (name: string, error: unknown) => void
  onGroupImageUploadError?: (groupName: string, index: number, fieldName: string, error: unknown) => void
}

const isGroupField = (entry: EditFormEntry): entry is EditFormGroupField => {
  return entry.type === 'group-list'
}

const EditForm = ({
  title,
  fields,
  onFieldChange,
  onGroupFieldChange,
  onGroupItemAdd,
  onGroupItemRemove,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  beforeActions,
  onImageUpload,
  onGroupImageUpload,
  onImageUploadError,
  onGroupImageUploadError,
}: EditFormProps) => {
  return (
    <EditFormLayout
      title={title}
      body={
        <>
          {fields.map((entry) => {
            if (isGroupField(entry)) {
              return (
                <EditFormGroup
                  key={entry.name}
                  name={entry.name}
                  label={entry.label}
                  fields={entry.fields}
                  maxItems={entry.maxItems}
                  onFieldChange={onGroupFieldChange}
                  onItemAdd={onGroupItemAdd}
                  onItemRemove={onGroupItemRemove}
                  onImageUpload={onGroupImageUpload}
                  onImageUploadError={onGroupImageUploadError}
                />
              )
            }

            return (
              <EditFormField
                key={entry.name}
                name={entry.name}
                label={entry.label}
                type={entry.type}
                value={entry.value}
                required={entry.required}
                placeholder={entry.placeholder}
                onChange={onFieldChange}
                onImageUpload={onImageUpload}
                onImageUploadError={onImageUploadError}
              />
            )
          })}
        </>
      }
      beforeActions={beforeActions}
      actions={
        <EditFormActions
          onSubmit={onSubmit}
          onCancel={onCancel}
          submitLabel={submitLabel}
          cancelLabel={cancelLabel}
        />
      }
    />
  )
}

export default EditForm
