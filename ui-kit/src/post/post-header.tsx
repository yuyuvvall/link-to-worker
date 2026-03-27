import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import './post-header.less'

export type PostHeaderProps = {
  profileImageUrl: string
  username: string
  onEditClick?: () => void
  onDeleteClick?: () => void
  onUsernameClick?: () => void
}

const PostHeader = ({ profileImageUrl, username, onEditClick, onDeleteClick, onUsernameClick }: PostHeaderProps) => {
  return (
    <div className="post-header">
      <div className="post-header__user-info">
        <Avatar
          className="post-header__avatar"
          src={profileImageUrl}
          alt={username}
        />
        <Typography
          className={`post-header__username${onUsernameClick ? ' post-header__username--clickable' : ''}`}
          variant="subtitle1"
          fontWeight="bold"
          onClick={onUsernameClick}
        >
          {username}
        </Typography>
      </div>
      {(onEditClick || onDeleteClick) && (
        <div className="post-header__actions">
          {onEditClick && (
            <IconButton
              className="post-header__edit-button"
              onClick={onEditClick}
              size="small"
              aria-label="Edit post"
            >
              <FontAwesomeIcon icon={faPen} />
            </IconButton>
          )}
          {onDeleteClick && (
            <IconButton
              className="post-header__delete-button"
              onClick={onDeleteClick}
              size="small"
              aria-label="Delete post"
            >
              <FontAwesomeIcon icon={faTrash} />
            </IconButton>
          )}
        </div>
      )}
    </div>
  )
}

export default PostHeader
