import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import AuthService from '../services/auth-service'

interface LoginFormData {
    email: string
    password: string
}

function LoginForm() {
    const navigate = useNavigate()
    const { register, handleSubmit } = useForm<LoginFormData>()

    const onSubmit = async (data: LoginFormData) => {
        try {
            const { request } = AuthService.authLogin(data)
            const res = await request
            localStorage.setItem('accessToken', res.data.accessToken)
            localStorage.setItem('refreshToken', res.data.refreshToken)
            navigate('/home')
        } catch (err) {
            console.error(err)
        }
    }

    const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            if (credentialResponse.credential) {
                const { request } = AuthService.googleLogin(credentialResponse.credential)
                const res = await request
                localStorage.setItem('accessToken', res.data.accessToken)
                localStorage.setItem('refreshToken', res.data.refreshToken)
                navigate('/home')
            }
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="vstack gap-2 col-md-6 mx-auto mt-4">
            <h1 className="d-flex justify-content-center">Login</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="vstack gap-2">
                    <input {...register("email", { required: true })} type="text" className="form-control" placeholder="Email" />
                    <input {...register("password", { required: true })} type="password" className="form-control" placeholder="Password" />
                    <button type="submit" className="btn btn-outline-secondary">Login</button>
                </div>
            </form>
            <div className="d-flex justify-content-center mt-3">
                <GoogleLogin onSuccess={onGoogleSuccess} onError={() => console.error('Google login failed')} />
            </div>
            <p className="text-center mt-2">
                Don't have an account? <a href="/register">Register</a>
            </p>
        </div>
    )
}

export default LoginForm
