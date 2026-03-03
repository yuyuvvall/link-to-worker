import { ResponsiveAppBar } from "@link-to-worker/ui-kit";

export type TabSelectorViewProps = {
  Component: React.ComponentType;
  index: number;
  siteTabs: { name: string; redirect: string }[];
};

export const TabSelectorView = ({ Component, index, siteTabs }: TabSelectorViewProps) => {
  return (
    <>
      <ResponsiveAppBar
        actions={[]}
        dir="ltr"
        logo="/logo.png"
        selectedTabIndex={index}
        tabs={siteTabs}
      />
      <Component />
    </>
  );
};
