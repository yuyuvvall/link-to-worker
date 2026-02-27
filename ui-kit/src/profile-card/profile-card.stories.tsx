import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import ProfileCard from './profile-card'

const meta = {
  title: 'ProfileCard',
  component: ProfileCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onEditClick: fn(),
  },
} satisfies Meta<typeof ProfileCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=yuvalyakubov',
    username: 'Yuval Yakubov',
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
  },
}

export const WithoutBanner: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=noalevi',
    username: 'Noa Levi',
    location: 'Haifa, Israel',
    badges: [
      {
        iconUrl: 'https://logo.clearbit.com/tau.ac.il',
        label: 'Academic Studies - Tel Aviv University',
      },
      {
        iconUrl: 'https://picsum.photos/seed/swim/32/32',
        label: 'Swimming Instructor',
      },
      {
        iconUrl: 'https://picsum.photos/seed/bake/32/32',
        label: 'Baking Enthusiast',
      },
    ],
  },
}

export const NoBadges: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=dancohen',
    username: 'Dan Cohen',
    location: 'Jerusalem, Israel',
    bannerImageUrl: 'https://picsum.photos/seed/banner2/700/150',
  },
}

export const MinimalProfile: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=tamarsh',
    username: 'Tamar Shalom',
  },
}

export const ManyBadges: Story = {
  args: {
    profileImageUrl: 'https://i.pravatar.cc/150?u=amitraz',
    username: 'Amit Raz',
    location: 'Rishon LeZion, Israel',
    bannerImageUrl: 'https://picsum.photos/seed/banner3/700/150',
    badges: [
      {
        iconUrl: 'https://logo.clearbit.com/thecheesecakefactory.com',
        label: 'The Cheesecake Factory',
      },
      {
        iconUrl: 'https://picsum.photos/seed/pingpong/32/32',
        label: 'Ping Pong Professional',
      },
      {
        iconUrl: 'https://logo.clearbit.com/tau.ac.il',
        label: 'Academic Studies - Tel Aviv University',
      },
      {
        iconUrl: 'https://picsum.photos/seed/guitar/32/32',
        label: 'Guitar Player',
      },
      {
        iconUrl: 'https://picsum.photos/seed/cook/32/32',
        label: 'Home Cooking Expert',
      },
      {
        iconUrl: 'https://picsum.photos/seed/photo/32/32',
        label: 'Photography Hobbyist',
      },
    ],
  },
}
