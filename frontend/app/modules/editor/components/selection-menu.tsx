import type { Editor } from '@tiptap/react';
import type { TFunction } from 'i18next';
import type React from 'react';

import type { RichTextEditorTypes } from '../rich-text-editor.types';
import { getActiveCommandName } from '../utils/commands';

type Props = {
	commands: RichTextEditorTypes.Command[];
	editor: Editor;
	t: TFunction<'editor'>;
};

export const SelectionMenu: React.FC<Props> = props => (
	<div className='selection-menu' role='toolbar' aria-label={props.t('editor.selectionMenu')}>
		{props.commands.map(command => {
			const Icon = command.icon;
			return (
				<button
					key={command.id}
					type='button'
					aria-label={command.label}
					aria-pressed={props.editor.isActive(getActiveCommandName(command))}
					title={`${command.label} (${command.shortcut})`}
					onMouseDown={event => event.preventDefault()}
					onClick={() => command.run()}
				>
					<Icon className='size-4' />
					<span>{command.label}</span>
				</button>
			);
		})}
	</div>
);
