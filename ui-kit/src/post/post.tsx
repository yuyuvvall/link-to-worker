import PostLayout from './post-layout'
import PostHeader from './post-header'
import PostContent from './post-content'
import PostActions from './post-actions'

export type PostProps = {
  profileImageUrl: string
  username: string
  text: string
  photoUrl?: string
  isLiked: boolean
  likesCount: number
  commentsCount: number
  onLikeClick: () => void
  onCommentClick: () => void
}

const Post = ({
  profileImageUrl,
  username,
  text,
  photoUrl,
  isLiked,
  likesCount,
  commentsCount,
  onLikeClick,
  onCommentClick,
}: PostProps) => {
  return (
    <PostLayout
      header={
        <PostHeader
          profileImageUrl={profileImageUrl}
          username={username}
        />
      }
      content={
        <PostContent
          text={text}
          photoUrl={photoUrl}
        />
      }
      actions={
        <PostActions
          isLiked={isLiked}
          likesCount={likesCount}
          commentsCount={commentsCount}
          onLikeClick={onLikeClick}
          onCommentClick={onCommentClick}
        />
      }
    />
  )
}

export default Post
