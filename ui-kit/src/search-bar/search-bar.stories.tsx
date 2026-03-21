import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import SearchBar from './search-bar'

const meta = {
  title: 'SearchBar',
  component: SearchBar,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onChange: fn(),
    onSubmit: fn(),
  },
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: 'frontend developer',
    isLoading: false,
  },
}

export const Empty: Story = {
  args: {
    value: '',
  },
}

export const Loading: Story = {
  args: {
    value: 'backend engineer',
    isLoading: true,
  },
}

export const LongQuery: Story = {
  args: {
    value: 'senior fullstack developer with 10 years of experience in React and Node.js',
  },
}
