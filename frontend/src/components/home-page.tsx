import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { PostsList } from '@link-to-worker/ui-kit'
import type { PostProps, PostsListItem } from '@link-to-worker/ui-kit'
import { SearchBar } from '@link-to-worker/ui-kit'
import UserService from '../services/user-service'
import PostService from '../services/post-service'
import type { PostData } from '../services/post-service'
import type { UserProfile } from '../types/user'
import useEditPost from '../hooks/use-edit-post'

const PAGE_SIZE = 5

const HomePage = () => {
  const navigate = useNavigate()
  const calledRef = useRef(false)

  const [posts, setPosts] = useState<PostData[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)
  const [profilesCache, setProfilesCache] = useState<Map<string, UserProfile>>(new Map())
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [authed, setAuthed] = useState(false)

  const { editingPostId, handleEditClick, renderEditForm } = useEditPost(posts, currentUser?._id, setPosts)

  useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true

    const checkAuth = async () => {
      try {
        const user = await UserService.getCurrentUser()
        setCurrentUser(user)
        setAuthed(true)
      } catch {
        navigate('/login')
      }
    }

    checkAuth()
  }, [navigate])

  const fetchPosts = useCallback(async (targetPage: number) => {
    setIsLoadingPosts(true)
    try {
      const { request } = PostService.getPosts(targetPage, PAGE_SIZE)
      const res = await request
      const newPosts = res.data

      setPosts((prev) => targetPage === 1 ? newPosts : [...prev, ...newPosts])
      setHasMore(newPosts.length === PAGE_SIZE)
    } catch (err: unknown) {
      console.error('Failed to load posts', err)
    } finally {
      setIsLoadingPosts(false)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    fetchPosts(1)
  }, [authed, fetchPosts])

  useEffect(() => {
    const uniqueAuthorIds = [...new Set(posts.map((p) => p.authorId))]
    const missing = uniqueAuthorIds.filter((id) => !profilesCache.has(id))

    if (missing.length === 0) return

    const fetchProfiles = async () => {
      const entries: [string, UserProfile][] = []
      for (const authorId of missing) {
        try {
          const profile = await UserService.getUserProfile(authorId)
          entries.push([authorId, profile])
        } catch (err) {
          console.error('Failed to load profile for', authorId, err)
        }
      }

      if (entries.length > 0) {
        setProfilesCache((prev) => {
          const next = new Map(prev)
          for (const [id, profile] of entries) {
            next.set(id, profile)
          }
          return next
        })
      }
    }

    fetchProfiles()
  }, [posts, profilesCache])

  const handleEndReached = useCallback(() => {
    if (isLoadingPosts || !hasMore) return
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage)
  }, [isLoadingPosts, hasMore, page, fetchPosts])

  const handleLikeClick = useCallback(async (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post
        const isLiked = post.isLikedByUser ?? false
        return {
          ...post,
          isLikedByUser: !isLiked,
          likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
        }
      }),
    )

    try {
      await PostService.toggleLike(postId)
    } catch (err) {
      console.error('Failed to toggle like', err)
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post
          const isLiked = post.isLikedByUser ?? false
          return {
            ...post,
            isLikedByUser: !isLiked,
            likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
          }
        }),
      )
    }
  }, [])

  const handleCommentClick = useCallback((postId: string) => {
    console.log('comment clicked', postId)
  }, [])
  const handleAiSearchSubmit = useCallback(async (query:string )=> {
    setIsLoadingPosts(true);
    try {
      const searchPosts = (await PostService.aiQuerySearch(query)).request.data
      setPosts(searchPosts);
      setPage(1);
    } catch (err) {
      console.error('Failed to perform AI search', err);
    } finally {
      setIsLoadingPosts(false);
    }
  },[])
  const mapPostsToListItems = (): PostsListItem<PostProps>[] => {
    return posts.map((post) => {
      const authorProfile = profilesCache.get(post.authorId)
      return {
        id: post._id,
        profileImageUrl: authorProfile?.photo ?? '',
        username: authorProfile?.username ?? '',
        text: post.content,
        photoUrl: post.photoUrl,
        isLiked: post.isLikedByUser ?? false,
        likesCount: post.likeCount,
        commentsCount: 0,
        isEditable: post.authorId === currentUser?._id,
      }
    })
  }

  if (!authed) {
    return <p className="text-center mt-4">Loading...</p>
  }

  return (
    <div className="vstack gap-3 col-md-8 mx-auto mt-4">
      <SearchBar
      onSubmit={handleAiSearchSubmit}
      />
      <PostsList
        posts={mapPostsToListItems()}
        hasMore={hasMore}
        isLoading={isLoadingPosts}
        onEndReached={handleEndReached}
        onLikeClick={handleLikeClick}
        onCommentClick={handleCommentClick}
        onEditClick={handleEditClick}
        editingPostId={editingPostId ?? undefined}
        renderEditForm={renderEditForm}
      />
    </div>
  )
}

export default HomePage
