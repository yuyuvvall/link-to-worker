import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import PostsList from './posts-list'
import type { PostsListItem } from './posts-list'
import type { PostProps } from '../post/post'

const samplePosts: PostsListItem<PostProps>[] = [
  {
    id: '1',
    profileImageUrl: 'https://i.pravatar.cc/150?u=yuvalyakubov',
    username: 'Yuval Yakubov',
    text: 'Just landed my dream job as a frontend developer! The interview process was tough but rewarding. Happy to share tips with anyone going through the same journey.',
    photoUrl: 'https://picsum.photos/seed/post1/600/400',
    isLiked: false,
    likesCount: 12,
    commentsCount: 3,
  },
  {
    id: '2',
    profileImageUrl: 'https://i.pravatar.cc/150?u=matanlatif',
    username: 'Matan Lati',
    text: 'Looking for advice on transitioning from backend to full-stack development. What resources would you recommend?',
    isLiked: false,
    likesCount: 8,
    commentsCount: 5,
  },
  {
    id: '3',
    profileImageUrl: 'https://i.pravatar.cc/150?u=eyalbendavid',
    username: 'Eyal Ben David',
    text: 'Pro tip: Always customize your resume for each job application. Generic resumes rarely make it past ATS systems.',
    photoUrl: 'https://picsum.photos/seed/post2/600/400',
    isLiked: true,
    likesCount: 47,
    commentsCount: 12,
  },
  {
    id: '4',
    profileImageUrl: 'https://i.pravatar.cc/150?u=noakirshenberg',
    username: 'Noa Kirshenberg',
    text: 'Finished my final project in fullstack development. Built a career networking platform from scratch with React, Node.js, and MongoDB. What a ride!',
    isLiked: false,
    likesCount: 23,
    commentsCount: 7,
  },
  {
    id: '5',
    profileImageUrl: 'https://i.pravatar.cc/150?u=shafur',
    username: 'Shafur',
    text: `After 10 years in the tech industry, here are the lessons I wish someone had told me on day one:

1. Your network is more valuable than your technical skills alone. Build genuine relationships.
2. Don't chase every new framework. Master the fundamentals first.
3. Soft skills will differentiate you more than another certification.
4. Take breaks seriously. Burnout is real and recovery is slow.
5. Document everything. Your future self will thank you.

What would you add to this list?`,
    photoUrl: 'https://picsum.photos/seed/post3/600/400',
    isLiked: true,
    likesCount: 182,
    commentsCount: 41,
  },
]

const generateManyPosts = (count: number): PostsListItem<PostProps>[] => {
  const names = [
    'Tal Aviram', 'Lior Cohen', 'Maya Baruch', 'Oren Shapira',
    'Shira Goldstein', 'Amit Peretz', 'Dana Levi', 'Roi Azulay',
    'Yael Mizrahi', 'Gal Friedman', 'Nir Kadosh', 'Tamar Hasson',
    'Ido Navon', 'Keren Alon', 'Arik Dahan', 'Roni Stern',
    'Hila Barak', 'Omri Katz', 'Liron Segal', 'Tomer Rubin',
  ]

  const texts = [
    'Just completed a TypeScript certification. The strict typing really changes how you think about code architecture.',
    'Hot take: soft skills matter more than technical skills for senior roles. Agree or disagree?',
    'Sharing my experience with system design interviews — thread below.',
    'Excited to announce I\'m joining a new startup as a tech lead! New challenges ahead.',
    'The best investment I made in my career was learning to communicate technical concepts to non-technical stakeholders.',
    'Day 100 of coding: Built 12 projects, contributed to 3 open source repos, and landed 2 interviews.',
    'Unpopular opinion: You don\'t need a CS degree to be a great developer. Passion and consistency matter more.',
    'Just deployed my first production app. The feeling is incredible!',
    'Looking for a study partner for AWS certification prep. Anyone interested?',
    'Resume tip: Quantify your achievements. "Improved load time by 40%" beats "Optimized website performance".',
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `gen-${i}`,
    profileImageUrl: `https://i.pravatar.cc/150?u=user${i}`,
    username: names[i % names.length],
    text: texts[i % texts.length],
    photoUrl: i % 3 === 0 ? `https://picsum.photos/seed/gen${i}/600/400` : undefined,
    isLiked: i % 4 === 0,
    likesCount: Math.floor(Math.random() * 200),
    commentsCount: Math.floor(Math.random() * 50),
  }))
}

const meta = {
  title: 'PostsList',
  component: PostsList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    hasMore: true,
    isLoading: false,
    onEndReached: fn(),
    onLikeClick: fn(),
    onCommentClick: fn(),
  },
} satisfies Meta<typeof PostsList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    posts: samplePosts,
  },
}

export const Loading: Story = {
  args: {
    posts: samplePosts,
    isLoading: true,
  },
}

export const AllLoaded: Story = {
  args: {
    posts: samplePosts,
    hasMore: false,
    isLoading: false,
  },
}

export const SinglePost: Story = {
  args: {
    posts: [samplePosts[0]],
  },
}

export const Empty: Story = {
  args: {
    posts: [],
    hasMore: false,
  },
}

export const ManyPosts: Story = {
  args: {
    posts: generateManyPosts(25),
  },
}
