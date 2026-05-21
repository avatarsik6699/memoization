import type { TFunction } from 'i18next';
import type React from 'react';

import { Input } from '@/components/ui/input';
import { DocumentTree } from '@/modules/document-tree/document-tree';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

import type { OfflineWorkspaceTypes } from '../offline-workspace.types';
import { StoragePanel } from '../storage-panel';

type Props = {
	workspace: OfflineWorkspaceTypes.WorkspaceController;
	t: TFunction<'editor'>;
};

export const WorkspaceSidebar: React.FC<Props> = props => (
	<aside className='workspace-sidebar'>
		<div className='workspace-label' aria-label={props.t('workspace.label')}>
			<Input
				value={props.workspace.workspaceName}
				aria-label={props.t('workspace.name')}
				onChange={event => props.workspace.setWorkspaceName(event.currentTarget.value)}
				onBlur={event => props.workspace.storeWorkspaceName(event.currentTarget.value, props.t)}
			/>
		</div>
		<label className='workspace-search'>
			<span>{props.t('workspace.search')}</span>
			<Input
				value={props.workspace.searchQuery}
				placeholder={props.t('workspace.searchPlaceholder')}
				aria-label={props.t('workspace.search')}
				onChange={event => props.workspace.setSearchQuery(event.currentTarget.value)}
			/>
		</label>
		<DocumentTree
			nodes={props.workspace.visibleTree}
			activeNodeId={props.workspace.activePage?.id ?? null}
			expandedIds={props.workspace.expandedIds}
			onToggle={id =>
				props.workspace.setExpandedIds(current => {
					const next = new Set(current);
					if (next.has(id)) next.delete(id);
					else next.add(id);
					return next;
				})
			}
			onSelect={node => void props.workspace.selectNode(node)}
			onCreate={(type, parentId) => void props.workspace.createNode(type, parentId)}
			onRename={(id, title) => void props.workspace.renameNode(id, title)}
			onDelete={id => void props.workspace.deleteNode(id)}
			onMove={(id, parentId) => void props.workspace.moveNode(id, parentId)}
		/>
		<div className='workspace-sidebar-footer'>
			<StoragePanel />
			<div className='workspace-sync-row'>
				<span>{props.t('workspace.cloudSync')}</span>
				<span className='workspace-sync-dot' aria-hidden='true' />
			</div>
			<div className='workspace-sidebar-tools'>
				<ThemeToggle />
				<LanguageSwitcher />
			</div>
		</div>
	</aside>
);
