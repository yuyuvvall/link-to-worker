import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import './edit-form-layout.less'

export type EditFormLayoutProps = {
  title: string
  body: ReactNode
  actions: ReactNode
}

const EditFormLayout = ({ title, body, actions }: EditFormLayoutProps) => {
  return (
    <Card className="edit-form-layout">
      <div className="edit-form-layout__header">
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </div>
      <div className="edit-form-layout__body">
        {body}
      </div>
      <div className="edit-form-layout__actions">
        {actions}
      </div>
    </Card>
  )
}

export default EditFormLayout
