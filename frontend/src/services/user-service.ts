// services/user-service.ts
import apiClient from './api-client'
import type { UserProfile, UpdateProfileData, UserResponse } from '../types/user'

const userApi = apiClient.create({
  baseURL: apiClient.defaults.baseURL + '/user',
})

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const controller = new AbortController()
  try {
    const res = await userApi.get<UserProfile>(`/${userId}`, { signal: controller.signal })
    return res.data
  } finally {
    controller.abort()
  }
}

export const updateUserProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  const controller = new AbortController()
  try {
    const res = await userApi.patch<UserProfile>('/', data, { signal: controller.signal })
    return res.data
  } finally {
    controller.abort()
  }
}

export const getCurrentUser = async (): Promise<UserResponse> => {
  const controller = new AbortController()
  try {
    const res = await userApi.get<UserResponse>('/me', { signal: controller.signal })
    return res.data
  } finally {
    controller.abort()
  }
}

export default {
  getUserProfile,
  updateUserProfile,
  getCurrentUser,
}