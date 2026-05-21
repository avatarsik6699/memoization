import type { TFunction } from 'i18next';
import type React from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

import type { RichTextEditorTypes } from '../rich-text-editor.types';

type Props = {
	activeCommandIndex: number;
	commands: RichTextEditorTypes.Command[];
	menuRef: React.RefObject<HTMLDivElement | null>;
	onCommandIndexChange: (index: number) => void;
	onFrameKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
	onRunCommand: (run: () => boolean) => void;
	t: TFunction<'editor'>;
};

export const SlashCommandMenu: React.FC<Props> = props => (
	<div
		ref={props.menuRef}
		className='slash-menu'
		role='menu'
		aria-label={props.t('editor.commandMenu')}
		tabIndex={-1}
		onKeyDownCapture={props.onFrameKeyDown}
	>
		{props.commands.map((command, index) => {
			const Icon = command.icon;
			return (
				<button
					key={command.id}
					type='button'
					role='menuitem'
					data-command-index={index}
					tabIndex={-1}
					aria-current={index === props.activeCommandIndex ? 'true' : undefined}
					onMouseDown={event => event.preventDefault()}
					onPointerMove={() => props.onCommandIndexChange(index)}
					onKeyDown={event => {
						if (event.key === 'ArrowDown') {
							event.preventDefault();
							props.onCommandIndexChange((index + 1) % props.commands.length);
							return;
						}
						if (event.key === 'ArrowUp') {
							event.preventDefault();
							props.onCommandIndexChange((index - 1 + props.commands.length) % props.commands.length);
							return;
						}
						if (event.key === 'Home') {
							event.preventDefault();
							props.onCommandIndexChange(0);
							return;
						}
						if (event.key === 'End') {
							event.preventDefault();
							props.onCommandIndexChange(props.commands.length - 1);
							return;
						}
						if (event.key === 'Enter') {
							event.preventDefault();
							props.onRunCommand(command.run);
							return;
						}
						if (/^[1-9]$/.test(event.key)) {
							const selectedCommand = props.commands[Number(event.key) - 1];
							if (!selectedCommand) return;
							event.preventDefault();
							props.onRunCommand(selectedCommand.run);
						}
					}}
					onClick={() => props.onRunCommand(command.run)}
				>
					<Icon className='size-4' />
					<span>{command.label}</span>
					<kbd>{index + 1}</kbd>
					<small>{command.shortcut}</small>
				</button>
			);
		})}
	</div>
);
