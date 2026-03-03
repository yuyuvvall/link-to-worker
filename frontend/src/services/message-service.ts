import apiClient from './api-client'
import type { IMessage } from '../types/chat'

const getChatHistory = (contactId: string) => {
    const controller = new AbortController()
    const request = apiClient.get<IMessage[]>(`/message/${contactId}`, { signal: controller.signal })
    return { request, cancel: () => controller.abort() }
}

export default { getChatHistory }