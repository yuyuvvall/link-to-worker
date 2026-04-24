import initApp from './server'
import http from 'http'
import https from 'https'

const HTTP_PORT = process.env.PORT || 80
const HTTPS_PORT = process.env.HTTPS_PORT || 443

initApp()
    .then((server) => {
        if (server instanceof https.Server) {
            server.listen(HTTPS_PORT, () => {
                console.log(`HTTPS Server running on port ${HTTPS_PORT}`)
            })
        } else {
            server.listen(HTTP_PORT, () => {
                console.log(`HTTP Server running on port ${HTTP_PORT}`)
            })
        }
    })
    .catch((err) => {
        console.error('Failed to start server:', err)
    })