import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/auth-service'

const HomePage = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken')
        if (!accessToken) {
            navigate('/login')
        }
    }, [navigate])

    const handleLogout = async () => {
        try {
            const { request } = AuthService.authLogout()
            await request
        } catch (err) {
            console.error(err)
        } finally {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            navigate('/login')
        }
    }

    return (
        <div className="vstack gap-2 col-md-6 mx-auto mt-4">
            <h1 className="d-flex justify-content-center">Home</h1>
            <p className="text-center">Welcome to Link-to-Worker!</p>
            <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
        </div>
    )
}

export default HomePage
