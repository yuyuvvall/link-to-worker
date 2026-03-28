import { useState } from 'react'
import type { CommentData } from '../services/post-service'

type CommentPanelProps = {
  comments: CommentData[]
  onSubmit: (content: string) => Promise<void>
  onClose: () => void
}

const CommentPanel = ({ comments, onSubmit, onClose }: CommentPanelProps) => {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) return
    setIsSubmitting(true)
    try {
      await onSubmit(trimmed)
      setContent('')
    } catch (err) {
      console.error('Failed to add comment', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Comments</h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {comments.length === 0 ? (
              <p className="text-muted text-center">No comments yet. Be the first!</p>
            ) : (
              <ul className="list-group list-group-flush">
                {comments.map((comment) => (
                  <li key={comment._id} className="list-group-item px-0">
                    <strong className="d-block mb-1">{comment.authorName}</strong>
                    <p className="mb-1">{comment.content}</p>
                    <small className="text-muted">
                      {new Date(comment.createdAt).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="modal-footer flex-column align-items-stretch gap-2">
            <textarea
              className="form-control"
              rows={2}
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommentPanel
