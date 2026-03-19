import type { AxiosResponse } from 'axios'
import apiClient from './api-client'

export type PostData = {
  _id: string
  authorId: string
  title: string
  content: string
  photoUrl?: string
  isLikedByUser : boolean
  likeCount: number
  comments: string[]
  createdAt: string
}

const postApi = apiClient.create({
  baseURL: apiClient.defaults.baseURL + '/post',
})

const getPosts = (page: number = 1, limit: number = 5, authorId?: string) => {
  const controller = new AbortController()
  const path = authorId ? `/${authorId}` : '/'
  const request = postApi.get<PostData[]>(path, {
    params: { page, limit },
    signal: controller.signal,
  })
  return { request, cancel: () => controller.abort() }
}

const createPost = (data: { title: string; content: string; photoUrl?: string }) => {
  const controller = new AbortController()
  const request = postApi.post<PostData>('/', data, {
    signal: controller.signal,
  })
  return { request, cancel: () => controller.abort() }
}

const toggleLike = async (postId: string) => {
  const controller = new AbortController()
  console.log('toggleLike called for post:', postId)
  const response: AxiosResponse = await postApi.put(`/like/${postId}`, {}, {
    signal: controller.signal,
  })
  return { response, cancel: () => controller.abort() }
}

const updatePost = (postId: string, data: { title: string; content: string; photoUrl?: string }) => {
  const controller = new AbortController()
  const request = postApi.put<PostData>(`/${postId}`, data, {
    signal: controller.signal,
  })
  return { request, cancel: () => controller.abort() }
}

const aiQuerySearch = (query:string)=> {
  const controller = new AbortController()
  const request = postApi.post<PostData[]>(`/aiSearch`, {query}, {
    signal: controller.signal,
  })
  return { request, cancel: () => controller.abort() }
}
export default { getPosts, createPost, toggleLike, updatePost,aiQuerySearch }
