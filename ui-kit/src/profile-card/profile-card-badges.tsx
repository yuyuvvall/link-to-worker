import './profile-card-badges.less'

export type ProfileCardBadge = {
  iconUrl: string
  label: string
}

export type ProfileCardBadgesProps = {
  badges: ProfileCardBadge[]
}

const ProfileCardBadges = ({ badges }: ProfileCardBadgesProps) => {
  return (
    <div className="profile-card-badges">
      {badges.map((badge) => (
        <div className="profile-card-badges__item" key={badge.label}>
          <img
            className="profile-card-badges__icon"
            src={badge.iconUrl}
            alt={badge.label}
          />
          <span className="profile-card-badges__label">{badge.label}</span>
        </div>
      ))}
    </div>
  )
}

export default ProfileCardBadges
