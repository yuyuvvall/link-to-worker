import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import './post-layout.less'

export type PostLayoutProps = {
  header: ReactNode
  content: ReactNode
  actions: ReactNode
}

const PostLayout =({ header, content, actions }: PostLayoutProps) => {
  return (
    <Card className="post-layout">
      <CardContent className="post-layout__body">
        <div className="post-layout__header">
          {header}
        </div>
        <div className="post-layout__content">
          {content}
        </div>
        <Divider />
        <div className="post-layout__actions">
          {actions}
        </div>
      </CardContent>
    </Card>
  )
}

export default PostLayout
