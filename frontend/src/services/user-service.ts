import apiClient from './api-client'

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

const getUserProfile = (userId: string) => {
  const controller = new AbortController()
  const request = apiClient.get<UserProfile>(`/user/${userId}`, {
    signal: controller.signal,
  })
  return { request, cancel: () => controller.abort() }
}

const updateUserProfile = (userId: string, data: UpdateProfileData) => {
  const controller = new AbortController()
  const request = apiClient.put<UserProfile>(`/user/${userId}`, data, {
    signal: controller.signal,
  })
  return { request, cancel: () => controller.abort() }
}

export default { getUserProfile, updateUserProfile }
