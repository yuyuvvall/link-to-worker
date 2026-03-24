import { useState, useCallback } from 'react'
import CommentPanel from '../components/comment-panel'
import PostService from '../services/post-service'
import type { PostData } from '../services/post-service'

const useComments = (
  posts: PostData[],
  setPosts: React.Dispatch<React.SetStateAction<PostData[]>>,
) => {
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null)

  const handleCommentClick = useCallback((postId: string) => {
    setCommentingPostId(postId)
  }, [])

  const handleAddComment = useCallback(async (postId: string, content: string) => {
    const { request } = await PostService.addComment(postId, content)
    const newComment = request.data
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId
          ? { ...p, comments: [...p.comments, newComment], commentCount: p.commentCount + 1 }
          : p,
      ),
    )
  }, [setPosts])

  const activePost = posts.find((p) => p._id === commentingPostId)

  const renderCommentModal =
    commentingPostId && activePost ? (
      <CommentPanel
        comments={activePost.comments}
        onSubmit={(content) => handleAddComment(commentingPostId, content)}
        onClose={() => setCommentingPostId(null)}
      />
    ) : null

  return { handleCommentClick, renderCommentModal }
}

export default useComments
