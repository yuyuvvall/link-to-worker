import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
})

// Request interceptor: attach JWT token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `JWT ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor: handle 403 with token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true
            const refreshToken = localStorage.getItem('refreshToken')
            if (refreshToken) {
                try {
                    // Use raw axios (not apiClient) to avoid interceptor recursion
                    const response = await axios.post('http://localhost:3000/auth/refreshToken', {}, {
                        headers: { Authorization: `JWT ${refreshToken}` }
                    })
                    const { accessToken, refreshToken: newRefreshToken } = response.data
                    localStorage.setItem('accessToken', accessToken)
                    localStorage.setItem('refreshToken', newRefreshToken)
                    originalRequest.headers.Authorization = `JWT ${accessToken}`
                    return apiClient(originalRequest)
                } catch (refreshError) {
                    localStorage.removeItem('accessToken')
                    localStorage.removeItem('refreshToken')
                    window.location.href = '/login'
                    return Promise.reject(refreshError)
                }
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient
