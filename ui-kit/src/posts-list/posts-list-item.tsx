import Post from '../post/post'
import type { PostProps } from '../post/post'
import type { PostsListItem } from './posts-list'
import './posts-list-item.less'

export type PostsListItemProps = {
  post: PostsListItem<PostProps>
  onLikeClick: () => void
  onCommentClick: () => void
  onEditClick?: () => void
  onUsernameClick?: () => void
}

const PostsListItem = ({ post, onLikeClick, onCommentClick, onEditClick, onUsernameClick }: PostsListItemProps) => {
  const { id: _id, isEditable: _isEditable, authorId: _authorId, ...postData } = post
  return (
    <div className="posts-list-item">
      <Post
        {...postData}
        onLikeClick={onLikeClick}
        onCommentClick={onCommentClick}
        onEditClick={onEditClick}
        onUsernameClick={onUsernameClick}
      />
    </div>
  )
}

export default PostsListItem
