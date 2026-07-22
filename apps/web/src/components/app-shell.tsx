import { Panel } from '@super-signal/ui/components/panel';
import { useCurrentNodeId } from '../hooks/use-current-node-id';
import { TitleBar } from './title-bar';
import { AddressBar } from './address-bar';
import { StatusBar } from './status-bar';
import { TreeSidebar } from './tree-sidebar';
import { MainView } from './main-view';
import { MembersPanel } from './members-panel';
import { CommandPrompt } from './command-prompt';

// The whole app window: title bar and address bar on top, the three-pane body
// (tree · content · members), and the status bar at the bottom. The current Node
// comes from the URL (`/n/$nodeId`); this component stays mounted as it changes.
export function AppShell() {
  const currentNodeId = useCurrentNodeId();

  return (
    <div className="flex h-screen flex-col bg-background p-3">
      <Panel className="flex min-h-0 flex-1 flex-col bg-secondary shadow-2xl">
        <TitleBar />
        <AddressBar currentNodeId={currentNodeId} />
        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[236px_1fr_210px]">
          <TreeSidebar currentNodeId={currentNodeId} />
          <MainView currentNodeId={currentNodeId} />
          <MembersPanel channelId={currentNodeId} />
        </div>
        <CommandPrompt currentNodeId={currentNodeId} />
        <StatusBar currentNodeId={currentNodeId} />
      </Panel>
    </div>
  );
}
