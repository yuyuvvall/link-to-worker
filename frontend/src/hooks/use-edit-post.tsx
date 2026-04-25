import { useState, useCallback } from 'react'
import { EditForm } from '@link-to-worker/ui-kit'
import type { EditFormEntry } from '@link-to-worker/ui-kit'
import apiClient from '../services/api-client'
import PostService from '../services/post-service'
import type { PostData } from '../services/post-service'

type EditPostFormState = {
  title: string
  content: string
  photo: string
}

const noopGroupFieldChange = () => {}
const noopGroupItemAdd = () => {}
const noopGroupItemRemove = () => {}

const useEditPost = (
  posts: PostData[],
  currentUserId: string | undefined,
  setPosts: React.Dispatch<React.SetStateAction<PostData[]>>,
) => {
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<EditPostFormState | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEditClick = useCallback((postId: string) => {
    const post = posts.find((p) => p._id === postId)
    if (!post || post.authorId !== currentUserId) return
    setEditFormData({
      title: post.title,
      content: post.content,
      photo: post.photoUrl ?? '',
    })
    setEditingPostId(postId)
    setEditError(null)
  }, [posts, currentUserId])

  const handleDeleteClick = useCallback(async (postId: string) => {
    const post = posts.find((p) => p._id === postId)
    if (!post || post.authorId !== currentUserId) return
    try {
      const { request } = PostService.deletePost(postId)
      await request
      setPosts((prev) => prev.filter((p) => p._id !== postId))
    } catch {
      setEditError('Failed to delete post. Please try again.')
    }
  }, [posts, currentUserId, setPosts])

  const handleFieldChange = useCallback((name: string, value: string) => {
    setEditFormData((prev) => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
  }, [])

  const handleImageUpload = useCallback(async (_name: string, file: File) => {
    const uploadData = new FormData()
    uploadData.append('file', file)
    const res = await apiClient.post('/file', uploadData, { withCredentials: true })
    return res.data.url as string
  }, [])

  const handleImageUploadError = useCallback(() => {
    setEditError('Failed to upload image. Please try again.')
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!editFormData || !editingPostId) return
    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      setEditError('Title and content are required.')
      return
    }
    setIsSubmitting(true)
    setEditError(null)
    try {
      const { request } = PostService.updatePost(editingPostId, {
        title: editFormData.title,
        content: editFormData.content,
        photoUrl: editFormData.photo || undefined,
      })
      await request
      setPosts((prev) => prev.map((p) => {
        if (p._id !== editingPostId) return p
        return { ...p, title: editFormData.title, content: editFormData.content, photoUrl: editFormData.photo || undefined }
      }))
      setEditingPostId(null)
      setEditFormData(null)
    } catch {
      setEditError('Failed to update post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [editFormData, editingPostId, setPosts])

  const handleCancel = useCallback(() => {
    setEditingPostId(null)
    setEditFormData(null)
    setEditError(null)
  }, [])

  const buildFields = useCallback((): EditFormEntry[] => {
    if (!editFormData) return []
    return [
      { name: 'title', label: 'Title', type: 'text' as const, value: editFormData.title, required: true },
      { name: 'content', label: 'Content', type: 'textarea' as const, value: editFormData.content, required: true },
      { name: 'photo', label: 'Photo', type: 'image' as const, value: editFormData.photo },
    ]
  }, [editFormData])

  const renderEditForm = useCallback(() => {
    if (!editFormData) return null
    return (
      <>
        {editError && <div className="alert alert-danger text-center">{editError}</div>}
        <EditForm
          title="Edit Post"
          fields={buildFields()}
          onFieldChange={handleFieldChange}
          onGroupFieldChange={noopGroupFieldChange}
          onGroupItemAdd={noopGroupItemAdd}
          onGroupItemRemove={noopGroupItemRemove}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onImageUpload={handleImageUpload}
          onImageUploadError={handleImageUploadError}
          submitLabel={isSubmitting ? 'Saving...' : 'Save'}
          cancelLabel="Cancel"
        />
      </>
    )
  }, [editFormData, editError, isSubmitting, handleFieldChange, handleSubmit, handleCancel, handleImageUpload, handleImageUploadError, buildFields])

  return {
    editingPostId,
    handleEditClick,
    handleDeleteClick,
    renderEditForm,
  }
}

export default useEditPost
