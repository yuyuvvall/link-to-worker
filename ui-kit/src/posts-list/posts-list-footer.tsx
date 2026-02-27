import CircularProgress from '@mui/material/CircularProgress'
import './posts-list-footer.less'

export type PostsListFooterProps = {
  isLoading: boolean
}

const PostsListFooter = ({ isLoading }: PostsListFooterProps) => {
  if (!isLoading) return null

  return (
    <div className="posts-list-footer">
      <CircularProgress size="2em" />
    </div>
  )
}

export default PostsListFooter
