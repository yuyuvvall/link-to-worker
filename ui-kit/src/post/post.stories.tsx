import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import Post from './post'

const meta = {
  title: 'Post',
  component: Post,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onLikeClick: fn(),
    onCommentClick: fn(),
  },
} satisfies Meta<typeof Post>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=yuvalyakubov',
    username: 'Yuval Yakubov',
    text: 'Just landed my dream job as a frontend developer! The interview process was tough but rewarding. Happy to share tips with anyone going through the same journey.',
    photoUrl: 'https://picsum.photos/seed/post1/600/400',
    isLiked: false,
    likesCount: 12,
    commentsCount: 3,
  },
}

export const WithoutPhoto: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=matanlatif',
    username: 'Matan Lati',
    text: 'Looking for advice on transitioning from backend to full-stack development. What resources would you recommend?',
    isLiked: false,
    likesCount: 8,
    commentsCount: 5,
  },
}

export const Liked: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=eyalbendavid',
    username: 'Eyal Ben David',
    text: 'Pro tip: Always customize your resume for each job application. Generic resumes rarely make it past ATS systems.',
    photoUrl: 'https://picsum.photos/seed/post2/600/400',
    isLiked: true,
    likesCount: 47,
    commentsCount: 12,
  },
}

export const ManyLikes: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=popular',
    username: 'Career Coach Pro',
    text: 'The top 5 skills employers are looking for in 2026. Thread below.',
    isLiked: true,
    likesCount: 1024,
    commentsCount: 256,
  },
}

export const LongText: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=longpost',
    username: 'Shafur',
    text: `After 10 years in the tech industry, here are the lessons I wish someone had told me on day one:

1. Your network is more valuable than your technical skills alone. Build genuine relationships.
2. Don't chase every new framework. Master the fundamentals first.
3. Soft skills will differentiate you more than another certification.
4. Take breaks seriously. Burnout is real and recovery is slow.
5. Document everything. Your future self will thank you.

What would you add to this list? I'd love to hear from others who've been in the trenches.`,
    isLiked: false,
    likesCount: 0,
    commentsCount: 0,
  },
}
