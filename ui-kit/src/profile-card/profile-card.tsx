import ProfileCardLayout from './profile-card-layout'
import ProfileCardBanner from './profile-card-banner'
import ProfileCardAvatar from './profile-card-avatar'
import ProfileCardInfo from './profile-card-info'
import ProfileCardBadges from './profile-card-badges'
import type { ProfileCardBadge } from './profile-card-badges'

export type { ProfileCardBadge }

export type ProfileCardProps = {
  profileImageUrl?: string
  username: string
  location?: string
  bannerImageUrl?: string
  badges?: ProfileCardBadge[]
  onEditClick?: () => void
  onChatClick?: () => void
}

const ProfileCard = ({
  profileImageUrl,
  username,
  location,
  bannerImageUrl,
  badges,
  onEditClick,
  onChatClick,
}: ProfileCardProps) => {
  return (
    <ProfileCardLayout
      banner={
        <ProfileCardBanner
          imageUrl={bannerImageUrl}
          onEditClick={onEditClick}
          onChatClick={onChatClick}
        />
      }
      avatar={profileImageUrl 
        ? <ProfileCardAvatar
          imageUrl={profileImageUrl}
          username={username}
          />
         : null
      }
      info={
        <ProfileCardInfo
          username={username}
          location={location}
        />
      }
      badges={
        badges && badges.length > 0
          ? <ProfileCardBadges badges={badges} />
          : null
      }
    />
  )
}

export default ProfileCard
