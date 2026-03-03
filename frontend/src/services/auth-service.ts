import apiClient from './api-client'
import type {
    RegistrationResponseData,
    RegisterData,
    LoginData,
    UserResponse,
} from '../types/auth'

const authApi = apiClient.create({
    baseURL: apiClient.defaults.baseURL + '/auth',
})

export const authRegister = async (registration: RegisterData): Promise<RegistrationResponseData> => {
    const controller = new AbortController()
    try {
        const res = await authApi.post<RegistrationResponseData>('/register', registration, { signal: controller.signal })
        return res.data
    } finally {
        controller.abort()
    }
}

export const authLogin = async (loginData: LoginData): Promise<UserResponse> => {
    const controller = new AbortController()
    try {
        const res = await authApi.post<UserResponse>('/login', loginData, { signal: controller.signal })
        return res.data
    } finally {
        controller.abort()
    }
}

export const authLogout = async (): Promise<void> => {
    const controller = new AbortController()
    try {
        await authApi.post('/logout', {}, { signal: controller.signal })
    } finally {
        controller.abort()
    }
}

export const googleLogin = async (credential: string): Promise<UserResponse> => {
    const controller = new AbortController()
    try {
        const res = await authApi.post<UserResponse>('/google', { credential }, { signal: controller.signal })
        return res.data
    } finally {
        controller.abort()
    }
}

export default {
    authRegister,
    authLogin,
    authLogout,
    googleLogin,
}