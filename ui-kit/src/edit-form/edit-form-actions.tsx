import Button from '@mui/material/Button'
import './edit-form-actions.less'

export type EditFormActionsProps = {
  onSubmit: () => void
  onCancel: () => void
  submitLabel?: string
  cancelLabel?: string
}

const EditFormActions = ({
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
}: EditFormActionsProps) => {
  return (
    <div className="edit-form-actions">
      <Button
        className="edit-form-actions__cancel"
        variant="outlined"
        onClick={onCancel}
      >
        {cancelLabel ?? 'Cancel'}
      </Button>
      <Button
        className="edit-form-actions__submit"
        variant="contained"
        onClick={onSubmit}
      >
        {submitLabel ?? 'Save'}
      </Button>
    </div>
  )
}

export default EditFormActions
