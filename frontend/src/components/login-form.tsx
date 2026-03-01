import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import AuthService from '../services/auth-service'

type LoginFormData = {
    email: string
    password: string
}

const LoginForm = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()
    const [loginError, setLoginError] = useState<string | null>(null)

    const onSubmit = async (data: LoginFormData) => {
        setLoginError(null)
        try {
            const { request } = AuthService.authLogin(data)
            const res = await request
            localStorage.setItem('accessToken', res.data.accessToken)
            localStorage.setItem('refreshToken', res.data.refreshToken)
            navigate('/home')
        } catch (err: any) {
            if (err.response?.data?.message) {
                setLoginError(err.response.data.message)
            } else {
                setLoginError('Something went wrong. Please try again.')
            }
        }
    }

    const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        setLoginError(null)
        try {
            if (credentialResponse.credential) {
                const { request } = AuthService.googleLogin(credentialResponse.credential)
                const res = await request
                localStorage.setItem('accessToken', res.data.accessToken)
                localStorage.setItem('refreshToken', res.data.refreshToken)
                navigate('/home')
            }
        } catch (err: any) {
            setLoginError('Google login failed. Please try again.')
        }
    }

    return (
        <div className="vstack gap-2 col-md-6 mx-auto mt-4">
            <h1 className="d-flex justify-content-center">Login</h1>

            {loginError && (
                <div className="alert alert-danger text-center">{loginError}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="vstack gap-2">
                    <input
                        {...register("email", { required: "Email is required" })}
                        type="text"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Email"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}

                    <input
                        {...register("password", { required: "Password is required" })}
                        type="password"
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}

                    <button type="submit" className="btn btn-outline-secondary">Login</button>
                </div>
            </form>

            <div className="d-flex justify-content-center mt-3">
                <GoogleLogin onSuccess={onGoogleSuccess} onError={() => setLoginError('Google login failed')} />
            </div>

            <p className="text-center mt-2">
                Don't have an account? <a href="/register">Register</a>
            </p>
        </div>
    )
}

export default LoginForm