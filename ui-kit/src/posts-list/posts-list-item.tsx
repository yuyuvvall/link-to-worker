import Post from '../post/post'
import type { PostProps } from '../post/post'
import type { PostsListItem } from './posts-list'
import './posts-list-item.less'

export type PostsListItemProps = {
  post: PostsListItem<PostProps>
  onLikeClick: () => void
  onCommentClick: () => void
}

const PostsListItem = ({ post, onLikeClick, onCommentClick }: PostsListItemProps) => {
  const { id, ...postData } = post
  return (
    <div className="posts-list-item">
      <Post
        {...postData}
        onLikeClick={onLikeClick}
        onCommentClick={onCommentClick}
      />
    </div>
  )
}

export default PostsListItem
