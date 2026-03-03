export type UserBadge = {
    iconUrl: string
    label: string
}

export type UserProfile = {
    _id: string
    email: string
    username: string
    photo: string
    location?: string
    bannerImageUrl?: string
    badges?: UserBadge[]
}

export type UpdateProfileData = {
    username?: string
    location?: string
    photo?: string
    bannerImageUrl?: string
    badges?: UserBadge[]
}

export type UserResponse = UserProfile