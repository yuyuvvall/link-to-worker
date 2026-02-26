import type { Meta, StoryObj } from "@storybook/react";
import { HelloWorld } from "./HelloWorld";

const meta: Meta<typeof HelloWorld> = {
  title: "Components/HelloWorld",
  component: HelloWorld,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof HelloWorld>;

export const Default: Story = {};

export const WithName: Story = {
  args: {
    name: "Storybook",
  },
};
