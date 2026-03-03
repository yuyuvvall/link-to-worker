import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { EditForm } from '@link-to-worker/ui-kit'
import type { EditFormEntry } from '@link-to-worker/ui-kit'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import apiClient from '../services/api-client'
import PostService from '../services/post-service'

type CreatePostFormState = {
  title: string
  content: string
  photo: string
}

const CreatePost = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [formData, setFormData] = useState<CreatePostFormState>({
    title: '',
    content: '',
    photo: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleGroupFieldChange = useCallback(
    () => {},
    [],
  )
  const handleGroupItemAdd = useCallback(() => {}, [])
  const handleGroupItemRemove = useCallback(() => {}, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const uploadData = new FormData()
      uploadData.append('file', file)
      const res = await apiClient.post('/file', uploadData, { withCredentials: true })
      setFormData((prev) => ({ ...prev, photo: res.data.url }))
    } catch {
      setFormError('Failed to upload image. Please try again.')
    }
  }

  const handleSubmit = useCallback(async () => {
    setFormError(null)

    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError('Title and content are required.')
      return
    }

    setIsSubmitting(true)
    try {
      const { request } = PostService.createPost({
        title: formData.title,
        content: formData.content,
        photoUrl: formData.photo || undefined,
      })
      await request
      navigate('/profile')
    } catch {
      setFormError('Failed to create post. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, navigate])

  const handleCancel = useCallback(() => {
    navigate('/profile')
  }, [navigate])

  const buildFields = (): EditFormEntry[] => [
    {
      name: 'title',
      label: 'Title',
      type: 'text' as const,
      value: formData.title,
      required: true,
    },
    {
      name: 'content',
      label: 'Content',
      type: 'textarea' as const,
      value: formData.content,
      required: true,
    },
    {
      name: 'photo',
      label: 'Photo',
      type: 'image' as const,
      value: formData.photo,
    },
  ]

  return (
    <div className="vstack gap-3 col-md-8 mx-auto mt-4">
      {formError && <div className="alert alert-danger text-center">{formError}</div>}

      <div className="d-flex justify-content-center">
        <EditForm
          title="Create Post"
          fields={buildFields()}
          onFieldChange={handleFieldChange}
          onGroupFieldChange={handleGroupFieldChange}
          onGroupItemAdd={handleGroupItemAdd}
          onGroupItemRemove={handleGroupItemRemove}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel={isSubmitting ? 'Publishing...' : 'Publish'}
          cancelLabel="Cancel"
        />
      </div>

      <div className="d-flex justify-content-center">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => fileInputRef.current?.click()}
        >
          <FontAwesomeIcon icon={faUpload} className="me-2" />
          Upload Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>
    </div>
  )
}

export default CreatePost
