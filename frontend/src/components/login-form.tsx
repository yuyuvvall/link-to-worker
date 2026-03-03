import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import AuthService from '../services/auth-service'
import userService from '../services/user-service'

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

type LoginFormData = { email: string; password: string }

const LoginForm = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>()
    const [loginError, setLoginError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const check = async () => {
            try { await userService.getCurrentUser(); navigate('/home', { replace: true }) } catch { }
            finally { setChecking(false) }
        }
        check()
    }, [navigate])

    if (checking) return <p className="text-center mt-4">Loading...</p>

    const onSubmit = async (data: LoginFormData) => {
        setLoginError(null)
        if (!emailRegex.test(data.email)) {
            setLoginError("Invalid email format")
            return
        }

        setIsSubmitting(true)
        try { await AuthService.authLogin(data); navigate('/home') }
        catch (err: any) { setLoginError(err.response?.data?.message || 'Something went wrong. Please try again.') }
        finally { setIsSubmitting(false) }
    }

    const onGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        setLoginError(null)
        setIsSubmitting(true)
        try {
            if (credentialResponse.credential) await AuthService.googleLogin(credentialResponse.credential)
            navigate('/home')
        } catch { setLoginError('Google login failed. Please try again.') }
        finally { setIsSubmitting(false) }
    }

    return (
        <div className="vstack gap-2 col-md-6 mx-auto mt-4">
            <h1 className="d-flex justify-content-center">Login</h1>
            {loginError && <div className="alert alert-danger text-center">{loginError}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="vstack gap-2">
                    <input {...register("email", { required: "Email is required" })} type="text" className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="Email" disabled={isSubmitting} />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}

                    <input {...register("password", { required: "Password is required" })} type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} placeholder="Password" disabled={isSubmitting} />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}

                    <button type="submit" className="btn btn-outline-secondary" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Login'}</button>
                </div>
            </form>

            <div className="d-flex justify-content-center mt-3">
                <GoogleLogin onSuccess={onGoogleSuccess} onError={() => setLoginError('Google login failed')} />
            </div>

            <p className="text-center mt-2">Don't have an account? <a href="/register">Register</a></p>
        </div>
    )
}

export default LoginForm