import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import apiClient from '../services/api-client'
import AuthService from '../services/auth-service'

const avatarImg = "https://via.placeholder.com/200?text=Avatar"

type FormData = {
    photo: FileList
    email: string
    password: string
}

const RegistrationForm = () => {
    const navigate = useNavigate()
    const { register, handleSubmit, watch } = useForm<FormData>()
    const [imgSrc, setImageSrc] = useState<string>("")
    const photoRef: { current: HTMLInputElement | null } = { current: null }
    const { ref, ...rest } = register('photo')

    const [photo] = watch(["photo"])

    useEffect(() => {
        if (photo && photo[0]) {
            const newUrl = URL.createObjectURL(photo[0])
            if (newUrl !== imgSrc) {
                setImageSrc(newUrl)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [photo])

    const handlePhotoClick = () => {
        photoRef.current?.click()
    }

    const uploadImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const formData = new window.FormData()
            formData.append("file", file)
            apiClient.post('/file?file=123.jpeg', formData, {
                headers: { 'Content-Type': 'image/jpeg' }
            }).then(res => {
                resolve(res.data.url)
            }).catch(err => {
                reject(err)
            })
        })
    }

    const onSubmit = async (data: FormData) => {
        try {
            let imgUrl = ""
            if (data.photo && data.photo[0]) {
                imgUrl = await uploadImage(data.photo[0])
            }
            const { request } = AuthService.authRegister({
                email: data.email,
                password: data.password,
                photo: imgUrl
            })
            await request

            // Auto-login after registration
            const { request: loginRequest } = AuthService.authLogin({
                email: data.email,
                password: data.password
            })
            const loginRes = await loginRequest
            localStorage.setItem('accessToken', loginRes.data.accessToken)
            localStorage.setItem('refreshToken', loginRes.data.refreshToken)
            navigate('/home')
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="vstack gap-2 col-md-6 mx-auto mt-4">
            <h1 className="d-flex justify-content-center">Registration Form</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="d-flex justify-content-center position-relative" style={{ width: "200px", margin: "0 auto" }}>
                    <div style={{ height: "200px", width: "200px" }}>
                        {imgSrc ? (
                            <img src={imgSrc} alt="Preview" className="img-fluid"
                                style={{ height: "200px", width: "200px", objectFit: "cover", borderRadius: "50%" }} />
                        ) : (
                            <img src={avatarImg} alt="Preview" className="img-fluid"
                                style={{ height: "200px", width: "200px", objectFit: "cover", borderRadius: "50%" }} />
                        )}
                    </div>
                    <div className="position-absolute bottom-0 end-0">
                        <button type="button" className="btn" onClick={handlePhotoClick}>
                            <FontAwesomeIcon icon={faImage} className="fa-xl" />
                        </button>
                    </div>
                </div>
                <input {...rest}
                    type="file"
                    name="photo"
                    ref={(e) => {
                        ref(e)
                        photoRef.current = e
                    }}
                    style={{ display: 'none' }}
                    accept="image/*"
                />
                <div className="vstack gap-2 mt-3">
                    <input {...register("email", { required: true })} type="text" className="form-control" placeholder="Email" />
                    <input {...register("password", { required: true })} type="password" className="form-control" placeholder="Password" />
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
