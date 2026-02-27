import { Virtuoso } from 'react-virtuoso'
import type { PostProps } from '../post/post'
import PostsListItemRow from './posts-list-item'
import PostsListFooter from './posts-list-footer'
import './posts-list.less'

export type PostsListItem<T = PostProps> = Omit<T, `on${string}`> & { id: string }

export type PostsListProps = {
  posts: PostsListItem<PostProps>[]
  hasMore: boolean
  isLoading: boolean
  onEndReached: () => void
  onLikeClick: (postId: string) => void
  onCommentClick: (postId: string) => void
}

const PostsList = ({
  posts,
  hasMore,
  isLoading,
  onEndReached,
  onLikeClick,
  onCommentClick,
}: PostsListProps) => {
  return (
    <div className="posts-list">
      <Virtuoso
        useWindowScroll
        data={posts}
        endReached={hasMore ? onEndReached : undefined}
        overscan={200}
        itemContent={(_index, post) => (
          <PostsListItemRow
            post={post}
            onLikeClick={() => onLikeClick(post.id)}
            onCommentClick={() => onCommentClick(post.id)}
          />
        )}
        components={{
          Footer: () => <PostsListFooter isLoading={isLoading} />,
        }}
      />
    </div>
  )
}

export default PostsList
