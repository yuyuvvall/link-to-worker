import apiClient from './api-client'

export type PostData = {
  _id: string
  authorId: string
  content: string
  photoUrl?: string
  likes: string[]
  commentsCount: number
  createdAt: string
}

const getUserPosts = (authorId: string) => {
  const controller = new AbortController()
  const request = apiClient.get<PostData[]>('/post', {
    params: { authorId },
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

export default { getUserPosts, toggleLike }
