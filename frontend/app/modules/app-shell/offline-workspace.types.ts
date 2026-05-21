import type { TFunction } from 'i18next';
import type React from 'react';

import type { Page, TiptapDocumentJSON, TreeNode } from '@/modules/storage/types';

export namespace OfflineWorkspaceTypes {
	export type SaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

	export type BeforeInstallPromptEvent = Event & {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
	};

	export type TreeActionType = 'page' | 'folder';

	export type WorkspaceState = {
		activePage: Page | null;
		activePath: string[];
		defaultWorkspaceName: string;
		documentContext: string;
		draft: TiptapDocumentJSON;
		expandedIds: Set<string>;
		mobileOpen: boolean;
		saveStatus: SaveStatus;
		searchQuery: string;
		visibleTree: TreeNode[];
		workspaceName: string;
	};

	export type WorkspaceActions = {
		createNode: (type: TreeActionType, parentId: string | null) => Promise<void>;
		deleteNode: (id: string) => Promise<void>;
		flush: () => Promise<void>;
		handleEditorChange: (content: TiptapDocumentJSON) => void;
		handleEditorFlush: () => void;
		moveNode: (id: string, parentId: string | null) => Promise<void>;
		renameNode: (id: string, title: string) => Promise<void>;
		selectNode: (node: TreeNode) => Promise<void>;
		setExpandedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
		setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
		setSearchQuery: (value: string) => void;
		setWorkspaceName: React.Dispatch<React.SetStateAction<string>>;
		storeWorkspaceName: (value: string, t: TFunction<'editor'>) => void;
		updateActivePageTitle: (title: string) => void;
	};

	export type WorkspaceController = WorkspaceState & WorkspaceActions;
}
