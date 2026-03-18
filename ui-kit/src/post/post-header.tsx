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
}

const PostHeader =({ profileImageUrl, username, onEditClick }: PostHeaderProps) => {
  return (
    <div className="post-header">
      <Avatar
        className="post-header__avatar"
        src={profileImageUrl}
        alt={username}
      />
      <Typography
        className="post-header__username"
        variant="subtitle1"
        fontWeight="bold"
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
