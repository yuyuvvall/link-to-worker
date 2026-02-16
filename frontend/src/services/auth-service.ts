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

export interface TokenResponse {
    accessToken: string
    refreshToken: string
}

const authRegister = (registration: RegisterData) => {
    const controller = new AbortController()
    const request = apiClient.post<RegistrationResponseData>("/auth/register",
        registration,
        { signal: controller.signal })
    return { request, cancel: () => controller.abort() }
}

const authLogin = (loginData: LoginData) => {
    const controller = new AbortController()
    const request = apiClient.post<TokenResponse>("/auth/login",
        loginData,
        { signal: controller.signal })
    return { request, cancel: () => controller.abort() }
}

const authLogout = () => {
    const controller = new AbortController()
    const refreshToken = localStorage.getItem('refreshToken')
    const request = apiClient.post("/auth/logout", {}, {
        headers: { Authorization: `JWT ${refreshToken}` },
        signal: controller.signal
    })
    return { request, cancel: () => controller.abort() }
}

const googleLogin = (credential: string) => {
    const controller = new AbortController()
    const request = apiClient.post<TokenResponse>("/auth/google",
        { credential },
        { signal: controller.signal })
    return { request, cancel: () => controller.abort() }
}

export default { authRegister, authLogin, authLogout, googleLogin }
