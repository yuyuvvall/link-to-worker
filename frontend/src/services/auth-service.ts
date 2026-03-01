import apiClient from "./api-client"

export interface RegistrationResponseData {
    email: string
    photo: string
    _id: string
}

export interface RegisterData {
    email: string
    password: string
    photo: string
}

export interface LoginData {
    email: string
    password: string
}

export interface UserResponse {
    _id: string
    email: string
    photo?: string
}

const authRegister = (registration: RegisterData) => {
    const controller = new AbortController()
    const request = apiClient.post<RegistrationResponseData>(
        "/auth/register",
        registration,
        { signal: controller.signal }
    )
    return { request, cancel: () => controller.abort() }
}

const authLogin = (loginData: LoginData) => {
    const controller = new AbortController()
    const request = apiClient.post<UserResponse>(
        "/auth/login",
        loginData,
        { signal: controller.signal }
    )
    return { request, cancel: () => controller.abort() }
}

const authLogout = () => {
    const controller = new AbortController()
    const request = apiClient.post(
        "/auth/logout",
        {},
        { signal: controller.signal }
    )
    return { request, cancel: () => controller.abort() }
}

const googleLogin = (credential: string) => {
    const controller = new AbortController()
    const request = apiClient.post<UserResponse>(
        "/auth/google",
        { credential },
        { signal: controller.signal }
    )
    return { request, cancel: () => controller.abort() }
}

// return the current authenticated user or throw if not logged in
const getCurrentUser = async (): Promise<UserResponse> => {
    const controller = new AbortController()
    try {
        const res = await apiClient.get<UserResponse>(
            "/auth/me",
            { signal: controller.signal }
        )
        return res.data
    } finally {
        // aborting after request ensures no lingering signal
        controller.abort()
    }
}

export default { authRegister, authLogin, authLogout, googleLogin, getCurrentUser }