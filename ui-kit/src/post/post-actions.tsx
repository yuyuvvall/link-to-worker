import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart, faComment } from '@fortawesome/free-solid-svg-icons'
import './post-actions.less'

export type PostActionsProps = {
  isLiked: boolean
  likesCount: number
  commentsCount: number
  onLikeClick: () => void
  onCommentClick: () => void
}

const PostActions =({
  isLiked,
  likesCount,
  commentsCount,
  onLikeClick,
  onCommentClick,
}: PostActionsProps) => {
  return (
    <div className="post-actions">
      <div className="post-actions__button-group">
        <IconButton onClick={onLikeClick}>
          <FontAwesomeIcon
            icon={faHeart}
            className={isLiked ? 'post-actions__icon--liked' : 'post-actions__icon--unliked'}
          />
        </IconButton>
        <Typography variant="body2" className="post-actions__count">
          {likesCount}
        </Typography>
      </div>
      <div className="post-actions__button-group">
        <IconButton onClick={onCommentClick}>
          <FontAwesomeIcon icon={faComment} className="post-actions__icon--unliked" />
        </IconButton>
        <Typography variant="body2" className="post-actions__count">
          {commentsCount}
        </Typography>
      </div>
    </div>
  )
}

export default PostActions
