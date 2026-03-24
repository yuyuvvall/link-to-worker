import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faComment } from '@fortawesome/free-solid-svg-icons'
import './profile-card-banner.less'

export type ProfileCardBannerProps = {
  imageUrl?: string
  onEditClick?: () => void
  onChatClick?: () => void
}

const ProfileCardBanner = ({ imageUrl, onEditClick, onChatClick }: ProfileCardBannerProps) => {
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
          aria-label="Edit profile"
        >
          <FontAwesomeIcon icon={faEdit} />
        </button>
      )}
      {onChatClick && (
        <button
          className="profile-card-banner__edit-button"
          onClick={onChatClick}
          aria-label="Chat with user"
        >
          <FontAwesomeIcon icon={faComment} />
        </button>
      )}
    </div>
  )
}

export default ProfileCardBanner
