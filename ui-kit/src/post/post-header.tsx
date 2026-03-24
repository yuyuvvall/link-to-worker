import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import './post-header.less'

export type PostHeaderProps = {
  profileImageUrl: string
  username: string
  onEditClick?: () => void
  onUsernameClick?: () => void
}

const PostHeader = ({ profileImageUrl, username, onEditClick, onUsernameClick }: PostHeaderProps) => {
  return (
    <div className="post-header">
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
    </div>
  )
}

export default PostHeader
