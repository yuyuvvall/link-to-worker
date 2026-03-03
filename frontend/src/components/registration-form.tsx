import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import apiClient from '../services/api-client'
import AuthService from '../services/auth-service'
import userService from '../services/user-service'

const avatarImg = "https://via.placeholder.com/200?text=Avatar"

type FormData = {
    photo: FileList
    username: string
    email: string
    password: string
}

const RegistrationForm = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
    const [imgSrc, setImageSrc] = useState<string>("")
    const [formError, setFormError] = useState<string | null>(null)
    const [checking, setChecking] = useState(true)
    const photoRef: { current: HTMLInputElement | null } = { current: null }
    const { ref, ...rest } = register('photo')
    const [photo] = watch(["photo"])

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await userService.getCurrentUser()
                navigate('/home', { replace: true })
            } catch { }
            finally {
                setChecking(false)
            }
        }
        checkAuth()
    }, [navigate])

    useEffect(() => {
        if (photo && photo[0]) {
            const newUrl = URL.createObjectURL(photo[0])
            setImageSrc(newUrl)
        }
    }, [photo])

    const handlePhotoClick = () => {
        photoRef.current?.click()
    }

    const uploadImage = async (file: File): Promise<string> => {
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await apiClient.post('/file', formData, { withCredentials: true })
            return res.data.url
        } catch {
            return avatarImg
        }
    }

    const onSubmit = async (data: FormData) => {
        setFormError(null)
        try {
            let imgUrl = avatarImg
            if (data.photo && data.photo[0]) {
                imgUrl = await uploadImage(data.photo[0])
            }

            await AuthService.authRegister({
                username: data.username,
                email: data.email,
                password: data.password,
                photo: imgUrl
            })

            await AuthService.authLogin({
                email: data.email,
                password: data.password
            })

            navigate('/home')
        } catch (err: any) {
            if (err.response?.data?.message) {
                setFormError(err.response.data.message)
            } else {
                setFormError('Something went wrong. Please try again.')
            }
        }
    }

    if (checking) return <p className="text-center mt-4">Loading...</p>

    return (
        <div className="vstack gap-2 col-md-6 mx-auto mt-4">
            <h1 className="d-flex justify-content-center">Registration Form</h1>
            {formError && <div className="alert alert-danger text-center">{formError}</div>}

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="d-flex justify-content-center position-relative" style={{ width: "200px", margin: "0 auto" }}>
                    <div style={{ height: "200px", width: "200px" }}>
                        <img
                            src={imgSrc || avatarImg}
                            alt="Preview"
                            className="img-fluid"
                            style={{ height: "200px", width: "200px", objectFit: "cover", borderRadius: "50%" }}
                        />
                    </div>
                    <div className="position-absolute bottom-0 end-0">
                        <button type="button" className="btn" onClick={handlePhotoClick}>
                            <FontAwesomeIcon icon={faImage} className="fa-xl" />
                        </button>
                    </div>
                </div>

                <input
                    {...rest}
                    type="file"
                    name="photo"
                    ref={(e) => { ref(e); photoRef.current = e }}
                    style={{ display: 'none' }}
                    accept="image/*"
                />

                <div className="vstack gap-2 mt-3">
                    <input
                        {...register("username", { required: "Username is required" })}
                        type="text"
                        className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                        placeholder="Username"
                    />
                    {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}

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

                    <button type="submit" className="btn btn-outline-secondary">Register</button>
                </div>
            </form>

            <p className="text-center mt-2">
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
    )
}

export default RegistrationForm