import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import './post-header.less'

export type PostHeaderProps = {
  profileImageUrl: string
  username: string
}

const PostHeader =({ profileImageUrl, username }: PostHeaderProps) => {
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
    </div>
  )
}

export default PostHeader
