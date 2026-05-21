import type { TFunction } from 'i18next';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/modules/editor/rich-text-editor';

import type { OfflineWorkspaceTypes } from '../offline-workspace.types';
import { formatRelativeUpdate } from '../utils/format-relative-update';

type Props = {
	workspace: OfflineWorkspaceTypes.WorkspaceController;
	t: TFunction<'editor'>;
};

export const EditorCanvas: React.FC<Props> = props => (
	<section className='editor-column'>
		{props.workspace.activePage ? (
			<article className='document-canvas'>
				<header className='document-title-block'>
					<p>{props.workspace.documentContext}</p>
					<input
						value={props.workspace.activePage.title}
						placeholder={props.t('editor.untitled')}
						onChange={event => props.workspace.updateActivePageTitle(event.currentTarget.value)}
						onBlur={event => void props.workspace.renameNode(props.workspace.activePage!.id, event.currentTarget.value)}
					/>
					<span>{formatRelativeUpdate(props.workspace.activePage.updatedAt, props.t)}</span>
				</header>
				<RichTextEditor
					content={props.workspace.draft}
					onChange={props.workspace.handleEditorChange}
					onFlush={props.workspace.handleEditorFlush}
				/>
			</article>
		) : (
			<div className='empty-editor'>
				<p>{props.t('editor.empty')}</p>
				<Button type='button' onClick={() => void props.workspace.createNode('page', null)}>
					{props.t('tree.newPage')}
				</Button>
			</div>
		)}
	</section>
);
