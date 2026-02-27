import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import './profile-card-banner.less'

export type ProfileCardBannerProps = {
  imageUrl?: string
  onEditClick?: () => void
}

const ProfileCardBanner = ({ imageUrl, onEditClick }: ProfileCardBannerProps) => {
  return (
    <div className="profile-card-banner">
      {imageUrl ? (
        <img
          className="profile-card-banner__image"
          src={imageUrl}
          alt="Profile banner"
        />
      ) : (
        <div className="profile-card-banner__fallback" />
      )}
      {onEditClick && (
        <button
          className="profile-card-banner__edit-button"
          onClick={onEditClick}
          aria-label="Edit banner"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
      )}
    </div>
  )
}

export default ProfileCardBanner
