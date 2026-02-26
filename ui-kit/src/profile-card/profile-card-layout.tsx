import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import './profile-card-layout.less'

export type ProfileCardLayoutProps = {
  banner: ReactNode
  avatar: ReactNode
  info: ReactNode
  badges: ReactNode
}

const ProfileCardLayout = ({ banner, avatar, info, badges }: ProfileCardLayoutProps) => {
  return (
    <Card className="profile-card-layout">
      <div className="profile-card-layout__banner">
        {banner}
      </div>
      <div className="profile-card-layout__avatar">
        {avatar}
      </div>
      <div className="profile-card-layout__body">
        <div className="profile-card-layout__info-section">
          {info}
        </div>
        <div className="profile-card-layout__badges-section">
          {badges}
        </div>
      </div>
    </Card>
  )
}

export default ProfileCardLayout
