export interface RegistrationResponseData {
    _id: string
    email: string
    username: string
    photo?: string
}

export interface RegisterData {
    email: string
    username: string
    password: string
    photo?: string
}

export interface LoginData {
    email: string
    password: string
}

export interface UserResponse {
    _id: string
    email: string
    username: string
    photo?: string
}