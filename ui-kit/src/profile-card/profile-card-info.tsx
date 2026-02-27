import Typography from '@mui/material/Typography'
import './profile-card-info.less'

export type ProfileCardInfoProps = {
  username: string
  location?: string
}

const ProfileCardInfo = ({ username, location }: ProfileCardInfoProps) => {
  return (
    <div className="profile-card-info">
      <Typography
        className="profile-card-info__username"
        variant="h6"
        fontWeight="bold"
      >
        {username}
      </Typography>
      {location && (
        <Typography
          className="profile-card-info__location"
          variant="body2"
        >
          {location}
        </Typography>
      )}
    </div>
  )
}

export default ProfileCardInfo
