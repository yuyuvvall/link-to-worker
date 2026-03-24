import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProfileCard, PostsList, EditForm } from '@link-to-worker/ui-kit'
import type { PostProps, PostsListItem, EditFormEntry, EditFormGroupFieldEntry } from '@link-to-worker/ui-kit'
import UserService from '../services/user-service'
import PostService from '../services/post-service'
import type { UserProfile, UserBadge } from '../types/user'
import type { PostData } from '../services/post-service'
import useEditPost from '../hooks/use-edit-post'

type EditFormState = {
  username: string
  location: string
  photo: string
  bannerImageUrl: string
  badges: UserBadge[]
}

export type ProfilePageProps = {
  initialProfile?: UserProfile
  initialPosts?: PostData[]
  userId?: string
}

const mapPostsToListItems = (
  postsData: PostData[],
  profile: UserProfile,
  currentUserId?: string,
): PostsListItem<PostProps>[] => {
  return postsData.map((post) => ({
    id: post._id,
    profileImageUrl: profile.photo ?? '',
    username: profile.username,
    text: post.content,
    photoUrl: post.photoUrl,
    isLiked: post.isLikedByUser ?? false,
    likesCount: post.likeCount,
    commentsCount: 0,
    isEditable: post.authorId === currentUserId,
  }))
}

const ProfilePage = ({ initialProfile, initialPosts, userId }: ProfilePageProps) => {
  const navigate = useNavigate()

  const PAGE_SIZE = 5

  const [profile, setProfile] = useState<UserProfile | null>(initialProfile ?? null)
  const [postsData, setPostsData] = useState<PostData[]>(initialPosts ?? [])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(!initialPosts)
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editFormData, setEditFormData] = useState<EditFormState | null>(null)

  const { editingPostId, handleEditClick, renderEditForm } = useEditPost(postsData, currentUser?._id, setPostsData)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await UserService.getCurrentUser()
        if (!user) {
          navigate('/login')
          return
        }
        setCurrentUser(user)
        if (userId && user._id === userId) {
          navigate('/profile', { replace: true })
          return
        }
        if (!userId || !initialProfile) {
          setProfile(user)
        }
      } catch {
        navigate('/login')
      }
    }
    fetchCurrentUser()

    if (userId && !initialProfile) {
      UserService.getUserProfile(userId).then((res) => {
        setProfile(res)
      }).catch((err) => {
        console.error('Failed to load profile', err)
      })
    }
  }, [userId, initialProfile, navigate])

  useEffect(() => {
    if (initialPosts || !profile) return

    const loadPosts = async () => {
      setIsLoadingPosts(true)
      try {
        const { request } = PostService.getPosts(1, PAGE_SIZE, profile._id)
        const res = await request
        setPostsData(res.data)
        setHasMore(res.data.length === PAGE_SIZE)
      } catch (err: unknown) {
        console.error('Failed to load posts', err)
      } finally {
        setIsLoadingPosts(false)
      }
    }

    loadPosts()
  }, [profile, initialPosts])

  const handleLikeClick = useCallback(async (postId: string) => {
    setPostsData((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id !== postId) return post

        const isLiked = post.isLikedByUser ?? false

        return {
          ...post,
          isLikedByUser: !isLiked,
          likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
        }
      })
    )

    try {
      await PostService.toggleLike(postId)
    } catch (err) {
      console.error('Failed to toggle like', err)

      // rollback if request fails
      setPostsData((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post

          const isLiked = post.isLikedByUser ?? false

          return {
            ...post,
            isLikedByUser: !isLiked,
            likeCount: isLiked ? post.likeCount - 1 : post.likeCount + 1,
          }
        })
      )
    }
  }, [])

  const handleCommentClick = useCallback((postId: string) => {
    console.log('comment clicked', postId)
  }, [])

  const handleEndReached = useCallback(async () => {
    if (isLoadingPosts || !hasMore || !profile) return
    const nextPage = page + 1
    setPage(nextPage)
    setIsLoadingPosts(true)
    try {
      const { request } = PostService.getPosts(nextPage, PAGE_SIZE, profile._id)
      const res = await request
      setPostsData((prev) => [...prev, ...res.data])
      setHasMore(res.data.length === PAGE_SIZE)
    } catch (err: unknown) {
      console.error('Failed to load more posts', err)
    } finally {
      setIsLoadingPosts(false)
    }
  }, [isLoadingPosts, hasMore, page, profile, PAGE_SIZE])

  const isOwnProfile = !!currentUser && !!profile && currentUser._id === profile._id

  const handleOpenChat = useCallback(() => {
    if (!profile) return
    navigate(`/chat/${profile._id}`)
  }, [profile, navigate])

  const openEditForm = useCallback(() => {
    if (!profile) return
    setEditFormData({
      username: profile.username,
      location: profile.location ?? '',
      photo: profile.photo ?? '',
      bannerImageUrl: profile.bannerImageUrl ?? '',
      badges: profile.badges ?? [],
    })
    setIsEditing(true)
  }, [profile])

  const handleFieldChange = useCallback((name: string, value: string) => {
    setEditFormData((prev) => {
      if (!prev) return prev
      return { ...prev, [name]: value }
    })
  }, [])

  const handleGroupFieldChange = useCallback(
    (_groupName: string, index: number, fieldName: string, value: string) => {
      setEditFormData((prev) => {
        if (!prev) return prev
        const badges = [...prev.badges]
        badges[index] = { ...badges[index], [fieldName]: value }
        return { ...prev, badges }
      })
    },
    [],
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleGroupItemAdd = useCallback((_groupName: string) => {
    setEditFormData((prev) => {
      if (!prev) return prev
      return { ...prev, badges: [...prev.badges, { iconUrl: '', label: '' }] }
    })
  }, [])

  const handleGroupItemRemove = useCallback((_groupName: string, index: number) => {
    setEditFormData((prev) => {
      if (!prev) return prev
      const badges = prev.badges.filter((_, i) => i !== index)
      return { ...prev, badges }
    })
  }, [])

  const handleEditSubmit = useCallback(async () => {
    if (!editFormData || !profile) return

    try {
      const updatedProfile = await UserService.updateUserProfile(profile._id, {
        username: editFormData.username,
        location: editFormData.location || undefined,
        photo: editFormData.photo,
        bannerImageUrl: editFormData.bannerImageUrl || undefined,
        badges: editFormData.badges,
      })
      setProfile(updatedProfile)
    } catch (err) {
      console.error('Failed to update profile', err)
    }

    setIsEditing(false)
    setEditFormData(null)
  }, [editFormData, profile])

  const handleEditCancel = useCallback(() => {
    setIsEditing(false)
    setEditFormData(null)
  }, [])

  const buildEditFields = (): EditFormEntry[] => {
    if (!editFormData) return []
    return [
      {
        name: 'username',
        label: 'Username',
        type: 'text' as const,
        value: editFormData.username,
        required: true,
      },
      {
        name: 'location',
        label: 'Location',
        type: 'text' as const,
        value: editFormData.location,
        placeholder: 'City, Country',
      },
      {
        name: 'photo',
        label: 'Profile Image',
        type: 'image' as const,
        value: editFormData.photo,
        required: true,
      },
      {
        name: 'bannerImageUrl',
        label: 'Banner Image',
        type: 'image' as const,
        value: editFormData.bannerImageUrl,
      },
      {
        name: 'badges',
        label: 'Badges',
        type: 'group-list' as const,
        fields: editFormData.badges.map<EditFormGroupFieldEntry[]>((b) => [
          { name: 'iconUrl', label: 'Icon URL', type: 'image' as const, value: b.iconUrl },
          { name: 'label', label: 'Label', type: 'text' as const, value: b.label },
        ]),
      },
    ]
  }

  if (!profile) {
    return (
      <div className="vstack gap-2 col-md-8 mx-auto mt-4">
        <p className="text-center">Loading profile...</p>
      </div>
    )
  }

  const posts: PostsListItem<PostProps>[] = mapPostsToListItems(postsData, profile, currentUser?._id)

  return (
    <div className="vstack gap-3 col-md-8 mx-auto mt-4">
      {isEditing && editFormData ? (
        <div className="d-flex justify-content-center">
          <EditForm
            title="Edit Profile"
            fields={buildEditFields()}
            onFieldChange={handleFieldChange}
            onGroupFieldChange={handleGroupFieldChange}
            onGroupItemAdd={handleGroupItemAdd}
            onGroupItemRemove={handleGroupItemRemove}
            onSubmit={handleEditSubmit}
            onCancel={handleEditCancel}
          />
        </div>
      ) : (
        <div className="d-flex justify-content-center">
          <ProfileCard
            profileImageUrl={profile.photo}
            username={profile.username}
            location={profile.location}
            bannerImageUrl={profile.bannerImageUrl}
            badges={profile.badges}
            onEditClick={isOwnProfile ? openEditForm : undefined}
            onChatClick={!isOwnProfile ? handleOpenChat : undefined}
          />
        </div>
      )}

      <PostsList
        posts={posts}
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

export default ProfilePage
