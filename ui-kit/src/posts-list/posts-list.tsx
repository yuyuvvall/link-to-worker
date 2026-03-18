import type { ReactNode } from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { PostProps } from '../post/post'
import PostsListItemRow from './posts-list-item'
import PostsListFooter from './posts-list-footer'
import './posts-list.less'

export type PostsListItem<T = PostProps> = Omit<T, `on${string}`> & { id: string; isEditable?: boolean }

export type PostsListProps = {
  posts: PostsListItem<PostProps>[]
  hasMore: boolean
  isLoading: boolean
  onEndReached: () => void
  onLikeClick: (postId: string) => void
  onCommentClick: (postId: string) => void
  onEditClick?: (postId: string) => void
  editingPostId?: string
  renderEditForm?: (postId: string) => ReactNode
}

const PostsList = ({
  posts,
  hasMore,
  isLoading,
  onEndReached,
  onLikeClick,
  onCommentClick,
  onEditClick,
  editingPostId,
  renderEditForm,
}: PostsListProps) => {
  return (
    <div className="posts-list">
      <Virtuoso
        useWindowScroll
        data={posts}
        endReached={hasMore ? onEndReached : undefined}
        overscan={200}
        itemContent={(_index, post) => {
          if (editingPostId === post.id && renderEditForm) {
            return <div className="posts-list-item">{renderEditForm(post.id)}</div>
          }
          return (
            <PostsListItemRow
              post={post}
              onLikeClick={() => onLikeClick(post.id)}
              onCommentClick={() => onCommentClick(post.id)}
              onEditClick={onEditClick && post.isEditable ? () => onEditClick(post.id) : undefined}
            />
          )
        }}
        components={{
          Footer: () => <PostsListFooter isLoading={isLoading} />,
        }}
      />
    </div>
  )
}

export default PostsList
