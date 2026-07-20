import { NODE_GENERAL } from '@super-signal/core/adapters/mock';
import { Panel } from '@super-signal/ui/components/panel';
import { useUiStore } from '../stores/ui-store';
import { TitleBar } from './title-bar';
import { AddressBar } from './address-bar';
import { StatusBar } from './status-bar';
import { TreeSidebar } from './tree-sidebar';
import { MainView } from './main-view';
import { MembersPanel } from './members-panel';

// The whole app window: title bar and address bar on top, the three-pane body
// (tree · content · members), and the status bar at the bottom. `NODE_GENERAL`
// is the default landing Node until the user selects one (a mock seed id, used
// only here at the app boundary).
export function AppShell() {
  const storeCurrent = useUiStore((state) => state.currentNodeId);
  const currentNodeId = storeCurrent ?? NODE_GENERAL;

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
        <StatusBar currentNodeId={currentNodeId} />
      </Panel>
    </div>
  );
}
