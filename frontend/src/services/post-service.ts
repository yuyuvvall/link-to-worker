import apiClient from './api-client'

export type PostData = {
  _id: string
  authorId: string
  title: string
  content: string
  photoUrl?: string
  likes: string[]
  comments: string[]
  createdAt: string
}

const postApi = apiClient.create({
  baseURL: apiClient.defaults.baseURL + '/post',
})

const getUserPosts = (authorId: string) => {
  const controller = new AbortController()
  const request = postApi.get<PostData[]>(`/${authorId}`, {
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

// TODO: implement toggleLike
const toggleLike = (postId: string) => {
  console.log('toggleLike called for post:', postId)
  const request = Promise.resolve()
  return { request, cancel: () => {} }
}

export default { getUserPosts, createPost, toggleLike }
