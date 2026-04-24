import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import EditForm from './edit-form'

const stubUpload = async (_name: string, _file: File) => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return 'https://picsum.photos/seed/uploaded/400/240'
}

const stubGroupUpload = async (
  _groupName: string,
  _index: number,
  _fieldName: string,
  _file: File,
) => {
  await new Promise((resolve) => setTimeout(resolve, 600))
  return 'https://picsum.photos/seed/uploaded-badge/64/64'
}

const meta = {
  title: 'EditForm',
  component: EditForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    onFieldChange: fn(),
    onGroupFieldChange: fn(),
    onGroupItemAdd: fn(),
    onGroupItemRemove: fn(),
    onSubmit: fn(),
    onCancel: fn(),
    onImageUpload: stubUpload,
    onGroupImageUpload: stubGroupUpload,
    onImageUploadError: fn(),
    onGroupImageUploadError: fn(),
  },
} satisfies Meta<typeof EditForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Edit Profile',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        value: 'Yuval Yakubov',
        required: true,
      },
      {
        name: 'location',
        label: 'Location',
        type: 'text',
        value: 'Tel Aviv District, Israel',
        placeholder: 'City, Country',
      },
      {
        name: 'profileImageUrl',
        label: 'Profile Image',
        type: 'image',
        value: 'https://i.pravatar.cc/150?u=yuvalyakubov',
        required: true,
      },
      {
        name: 'bannerImageUrl',
        label: 'Banner Image',
        type: 'image',
        value: 'https://picsum.photos/seed/banner1/700/150',
      },
      {
        name: 'badges',
        label: 'Badges',
        type: 'group-list',
        fields: [
          [
            { name: 'iconUrl', label: 'Icon URL', type: 'image', value: 'https://logo.clearbit.com/thecheesecakefactory.com' },
            { name: 'label', label: 'Label', type: 'text', value: 'The Cheesecake Factory' },
          ],
          [
            { name: 'iconUrl', label: 'Icon URL', type: 'image', value: 'https://logo.clearbit.com/colman.ac.il' },
            { name: 'label', label: 'Label', type: 'text', value: 'The College of Management Academic Studies' },
          ],
        ],
      },
    ],
  },
}

export const EmptyForm: Story = {
  args: {
    title: 'Edit Profile',
    fields: [
      { name: 'username', label: 'Username', type: 'text', value: '', required: true },
      { name: 'location', label: 'Location', type: 'text', value: '', placeholder: 'City, Country' },
      { name: 'profileImageUrl', label: 'Profile Image', type: 'image', value: '' },
      { name: 'bannerImageUrl', label: 'Banner Image', type: 'image', value: '' },
      {
        name: 'badges',
        label: 'Badges',
        type: 'group-list',
        fields: [],
      },
    ],
  },
}

export const WithoutGroups: Story = {
  args: {
    title: 'Account Settings',
    submitLabel: 'Update',
    cancelLabel: 'Discard',
    fields: [
      { name: 'displayName', label: 'Display Name', type: 'text', value: 'Noa Levi', required: true },
      { name: 'email', label: 'Email', type: 'text', value: 'noa.levi@example.com', required: true },
      { name: 'bio', label: 'Bio', type: 'textarea', value: 'Full-stack developer based in Haifa. Passionate about clean code and open source.' },
    ],
  },
}

export const ManyGroupItems: Story = {
  args: {
    title: 'Edit Skills & Badges',
    fields: [
      { name: 'username', label: 'Username', type: 'text', value: 'Amit Raz', required: true },
      {
        name: 'badges',
        label: 'Badges',
        type: 'group-list',
        fields: [
          [
            { name: 'iconUrl', label: 'Icon URL', type: 'image', value: 'https://logo.clearbit.com/thecheesecakefactory.com' },
            { name: 'label', label: 'Label', type: 'text', value: 'The Cheesecake Factory' },
          ],
          [
            { name: 'iconUrl', label: 'Icon URL', type: 'image', value: 'https://picsum.photos/seed/pingpong/32/32' },
            { name: 'label', label: 'Label', type: 'text', value: 'Ping Pong Professional' },
          ],
          [
            { name: 'iconUrl', label: 'Icon URL', type: 'image', value: 'https://logo.clearbit.com/tau.ac.il' },
            { name: 'label', label: 'Label', type: 'text', value: 'Academic Studies - Tel Aviv University' },
          ],
          [
            { name: 'iconUrl', label: 'Icon URL', type: 'image', value: 'https://picsum.photos/seed/guitar/32/32' },
            { name: 'label', label: 'Label', type: 'text', value: 'Guitar Player' },
          ],
          [
            { name: 'iconUrl', label: 'Icon URL', type: 'image', value: 'https://picsum.photos/seed/cook/32/32' },
            { name: 'label', label: 'Label', type: 'text', value: 'Home Cooking Expert' },
          ],
          [
            { name: 'iconUrl', label: 'Icon URL', type: 'image', value: 'https://picsum.photos/seed/photo/32/32' },
            { name: 'label', label: 'Label', type: 'text', value: 'Photography Hobbyist' },
          ],
        ],
      },
    ],
  },
}
