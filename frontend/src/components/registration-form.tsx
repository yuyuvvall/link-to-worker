import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import apiClient from '../services/api-client'
import AuthService from '../services/auth-service'
import userService from '../services/user-service'

const avatarImg = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8oghbsuzggpkknQSSU-Ch_xep_9v3m6EeBQ&s"

type FormData = { photo: FileList; username: string; email: string; password: string }
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const RegistrationForm = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()
    const [imgSrc, setImageSrc] = useState<string>("")
    const [formError, setFormError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const photoRef: { current: HTMLInputElement | null } = { current: null }
    const { ref, ...rest } = register('photo')
    const [photo] = watch(["photo"])
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const checkAuth = async () => { try { await userService.getCurrentUser(); navigate('/home', { replace: true }) } catch { } finally { setChecking(false) } }
        checkAuth()
    }, [navigate])

    useEffect(() => { if (photo && photo[0]) setImageSrc(URL.createObjectURL(photo[0])) }, [photo])
    const handlePhotoClick = () => { photoRef.current?.click() }

    const uploadImage = async (file: File): Promise<string> => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        const maxSize = 5 * 1024 * 1024
        if (!allowedTypes.includes(file.type)) throw new Error('Invalid file type')
        if (file.size > maxSize) throw new Error('File is too large')

        const formData = new FormData()
        formData.append("file", file)
        const res = await apiClient.post('/file', formData, { withCredentials: true })
        return res.data.url
    }

    const onSubmit = async (data: FormData) => {
        setFormError(null)
        if (!emailRegex.test(data.email)) { setFormError("Invalid email format"); return }

        setUploading(true)
        try {
            let imgUrl = avatarImg
            if (data.photo && data.photo[0]) imgUrl = await uploadImage(data.photo[0])
            await AuthService.authRegister({ username: data.username, email: data.email, password: data.password, photo: imgUrl })
            await AuthService.authLogin({ email: data.email, password: data.password })
            navigate('/home')
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Something went wrong.'
            setFormError(msg)
        } finally {
            setUploading(false)
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
                        <img src={imgSrc || avatarImg} alt="Preview" className="img-fluid" style={{ height: "200px", width: "200px", objectFit: "cover", borderRadius: "50%" }} />
                    </div>
                    <div className="position-absolute bottom-0 end-0">
                        <button type="button" className="btn" onClick={handlePhotoClick}>
                            <FontAwesomeIcon icon={faImage} className="fa-xl" />
                        </button>
                    </div>
                </div>

                <input {...rest} type="file" ref={(e) => { ref(e); photoRef.current = e }} style={{ display: 'none' }} accept="image/*" />

                <div className="vstack gap-2 mt-3">
                    <input {...register("username", { required: "Username is required" })} type="text" className={`form-control ${errors.username ? 'is-invalid' : ''}`} placeholder="Username" />
                    {errors.username && <div className="invalid-feedback">{errors.username.message}</div>}

                    <input {...register("email", { required: "Email is required" })} type="text" className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="Email" />
                    {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}

                    <input {...register("password", { required: "Password is required" })} type="password" className={`form-control ${errors.password ? 'is-invalid' : ''}`} placeholder="Password" />
                    {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}

                    <button type="submit" className="btn btn-outline-secondary" disabled={uploading}>{uploading ? 'Uploading...' : 'Register'}</button>
                </div>
            </form>

            <p className="text-center mt-2">Already have an account? <a href="/login">Login</a></p>
        </div>
    )
}

export default RegistrationForm