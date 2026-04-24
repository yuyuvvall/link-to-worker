// services/api-client.ts
import axios from 'axios'

const apiClient = axios.create({
    baseURL: 'http://node04.cs.colman.ac.il:80',
    withCredentials: true,
})

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (
            originalRequest.url?.includes('/auth/login') ||
            originalRequest.url?.includes('/auth/google') ||
            originalRequest.url?.includes('/auth/register') ||
            originalRequest.url?.includes('/auth/refreshToken')
        ) {
            return Promise.reject(error)
        }

        if (error.response?.status === 403 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                await axios.post(
                    'http://node04.cs.colman.ac.il:80/auth/refreshToken',
                    {},
                    { withCredentials: true }
                )
                return apiClient(originalRequest)
            } catch (refreshError) {
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient