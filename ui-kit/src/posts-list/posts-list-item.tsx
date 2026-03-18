import Post from '../post/post'
import type { PostProps } from '../post/post'
import type { PostsListItem } from './posts-list'
import './posts-list-item.less'

export type PostsListItemProps = {
  post: PostsListItem<PostProps>
  onLikeClick: () => void
  onCommentClick: () => void
  onEditClick?: () => void
}

const PostsListItem = ({ post, onLikeClick, onCommentClick, onEditClick }: PostsListItemProps) => {
  const { id, isEditable, ...postData } = post
  return (
    <div className="posts-list-item">
      <Post
        {...postData}
        onLikeClick={onLikeClick}
        onCommentClick={onCommentClick}
        onEditClick={onEditClick}
      />
    </div>
  )
}

export default PostsListItem
