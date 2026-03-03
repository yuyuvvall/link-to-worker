import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/auth-service'
import userService from '../services/user-service'

const HomePage = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const calledRef = useRef(false)

    useEffect(() => {
        if (calledRef.current) return
        calledRef.current = true

        const checkAuth = async () => {
            try {
                await userService.getCurrentUser()
            } catch {
                navigate('/login')
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [navigate])

    const handleLogout = async () => {
        try {
            await AuthService.authLogout()
        } catch (err) {
            console.error(err)
        } finally {
            navigate('/login')
        }
    }

    if (loading) return <p className="text-center mt-4">Loading...</p>

    return (
        <div className="vstack gap-2 col-md-6 mx-auto mt-4">
            <h1 className="d-flex justify-content-center">Home</h1>
            <p className="text-center">Welcome to Link-to-Worker!</p>
            <button onClick={handleLogout} className="btn btn-outline-danger">Logout</button>
        </div>
    )
}

export default HomePage