import type { TFunction } from 'i18next';
import { Download, Menu, Save, Share2, WifiOff } from 'lucide-react';
import type React from 'react';

import { Button } from '@/components/ui/button';

import type { OfflineWorkspaceTypes } from '../offline-workspace.types';

type Props = {
	activeTitle: string | null;
	installPrompt: OfflineWorkspaceTypes.BeforeInstallPromptEvent | null;
	onInstall: () => void;
	onOpenDocuments: () => void;
	saveStatus: OfflineWorkspaceTypes.SaveStatus;
	t: TFunction<'editor'>;
};

export const WorkspaceTopbar: React.FC<Props> = props => (
	<header className='workspace-topbar'>
		<div className='workspace-topbar-left'>
			<Button
				type='button'
				size='icon-sm'
				variant='ghost'
				className='workspace-menu-button'
				aria-label={props.t('workspace.openDocuments')}
				onClick={props.onOpenDocuments}
			>
				<Menu />
			</Button>
			<span className='workspace-breadcrumb'>{props.activeTitle ?? props.t('editor.untitled')}</span>
			<span className={`save-status save-${props.saveStatus}`}>
				{props.saveStatus === 'saving' ? <Save className='size-3' /> : null}
				{props.t(`status.${props.saveStatus}`)}
			</span>
		</div>
		<div className='workspace-tools'>
			<WifiOff className='size-4' />
			<span>{props.t('workspace.offline')}</span>
			{props.installPrompt ? (
				<Button type='button' size='sm' variant='outline' onClick={props.onInstall}>
					<Download /> {props.t('workspace.install')}
				</Button>
			) : null}
			<Button type='button' size='sm' variant='outline'>
				<Share2 /> {props.t('workspace.share')}
			</Button>
			<Button type='button' size='sm'>
				{props.t('workspace.publish')}
			</Button>
		</div>
	</header>
);
