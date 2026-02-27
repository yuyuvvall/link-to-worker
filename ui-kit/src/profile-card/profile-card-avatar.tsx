import Avatar from '@mui/material/Avatar'
import './profile-card-avatar.less'

export type ProfileCardAvatarProps = {
  imageUrl: string
  username: string
}

const ProfileCardAvatar = ({ imageUrl, username }: ProfileCardAvatarProps) => {
  return (
    <div className="profile-card-avatar">
      <Avatar
        className="profile-card-avatar__image"
        src={imageUrl}
        alt={username}
      />
    </div>
  )
}

export default ProfileCardAvatar
