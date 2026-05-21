import type React from 'react';
import { useTranslation } from 'react-i18next';

import { EditorCanvas } from './components/editor-canvas';
import { MobileDocumentDrawer } from './components/mobile-document-drawer';
import { WorkspaceSidebar } from './components/workspace-sidebar';
import { WorkspaceTopbar } from './components/workspace-topbar';
import { useInstallPrompt } from './hooks/use-install-prompt';
import { useOfflineWorkspace } from './hooks/use-offline-workspace';

export const OfflineWorkspace: React.FC = () => {
	const translation = useTranslation('editor');
	const workspace = useOfflineWorkspace(translation.t);
	const installPromptController = useInstallPrompt();

	return (
		<div className='workspace'>
			<div className='workspace-desktop-sidebar'>
				<WorkspaceSidebar workspace={workspace} t={translation.t} />
			</div>
			{workspace.mobileOpen ? (
				<MobileDocumentDrawer t={translation.t} onClose={() => workspace.setMobileOpen(false)}>
					<WorkspaceSidebar workspace={workspace} t={translation.t} />
				</MobileDocumentDrawer>
			) : null}
			<main className='workspace-main'>
				<WorkspaceTopbar
					activeTitle={workspace.activePage?.title ?? null}
					installPrompt={installPromptController.installPrompt}
					onInstall={installPromptController.promptInstall}
					onOpenDocuments={() => workspace.setMobileOpen(true)}
					saveStatus={workspace.saveStatus}
					t={translation.t}
				/>
				<EditorCanvas workspace={workspace} t={translation.t} />
			</main>
		</div>
	);
};
