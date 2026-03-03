import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProfilePage from './profile-page'
import type { UserProfile } from '../services/user-service'
import type { PostData } from '../services/post-service'

const mockProfile: UserProfile = {
  _id: 'user-1',
  email: 'yuval@example.com',
  username: 'Yuval Yakubov',
  photo: 'https://i.pravatar.cc/150?u=yuvalyakubov',
  location: 'Tel Aviv District, Israel',
  bannerImageUrl: 'https://picsum.photos/seed/banner1/700/150',
  badges: [
    {
      iconUrl: 'https://logo.clearbit.com/thecheesecakefactory.com',
      label: 'The Cheesecake Factory',
    },
    {
      iconUrl: 'https://logo.clearbit.com/colman.ac.il',
      label: 'The College of Management Academic Studies',
    },
  ],
}

const mockPosts: PostData[] = [
  {
    _id: '1',
    authorId: 'user-1',
    content:
      'Just landed my dream job as a frontend developer! The interview process was tough but rewarding. Happy to share tips with anyone going through the same journey.',
    photoUrl: 'https://picsum.photos/seed/post1/600/400',
    likes: ['user-2', 'user-3'],
    commentsCount: 3,
    createdAt: '2026-02-20T10:00:00Z',
  },
  {
    _id: '4',
    authorId: 'user-1',
    content:
      'Finished my final project in fullstack development. Built a career networking platform from scratch with React, Node.js, and MongoDB. What a ride!',
    photoUrl: undefined,
    likes: [],
    commentsCount: 7,
    createdAt: '2026-02-18T14:30:00Z',
  },
]

const withRouterDecorator = (initialPath: string) => (Story: () => React.JSX.Element) => {
  localStorage.setItem('accessToken', 'mock-token')
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/profile/:userId" element={<Story />} />
      </Routes>
    </MemoryRouter>
  )
}

const meta = {
  title: 'ProfilePage',
  component: ProfilePage,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [withRouterDecorator('/profile/user-1')],
} satisfies Meta<typeof ProfilePage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    initialProfile: mockProfile,
    initialPosts: mockPosts,
  },
}

export const NoPosts: Story = {
  args: {
    initialProfile: mockProfile,
    initialPosts: [],
  },
}

export const LoadingPosts: Story = {
  args: {
    initialProfile: mockProfile,
    initialPosts: [],
  },
}

export const ManyPosts: Story = {
  args: {
    initialProfile: mockProfile,
    initialPosts: Array.from({ length: 10 }, (_, i) => ({
      _id: `post-${i}`,
      authorId: 'user-1',
      content: [
        'Pro tip: Always customize your resume for each job application. Generic resumes rarely make it past ATS systems.',
        'The best investment I made in my career was learning to communicate technical concepts to non-technical stakeholders.',
        'Just completed a TypeScript certification. The strict typing really changes how you think about code architecture.',
        'Day 100 of coding: Built 12 projects, contributed to 3 open source repos, and landed 2 interviews.',
        'Resume tip: Quantify your achievements. "Improved load time by 40%" beats "Optimized website performance".',
      ][i % 5],
      photoUrl: i % 3 === 0 ? `https://picsum.photos/seed/gen${i}/600/400` : undefined,
      likes: Array.from({ length: i * 3 }, (_, j) => `user-${j}`),
      commentsCount: i * 2,
      createdAt: `2026-02-${String(20 - i).padStart(2, '0')}T10:00:00Z`,
    })),
  },
}
