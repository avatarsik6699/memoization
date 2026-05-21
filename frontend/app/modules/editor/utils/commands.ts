import type { Editor } from '@tiptap/react';
import type { TFunction } from 'i18next';
import { Bold, Code2, Heading2, Italic, List, Minus, Pilcrow } from 'lucide-react';

import type { RichTextEditorTypes } from '../rich-text-editor.types';

export const getEditorCommands = (editor: Editor, t: TFunction<'editor'>): RichTextEditorTypes.Command[] => [
	{
		id: 'paragraph',
		label: t('editor.paragraph'),
		shortcut: 'Ctrl Alt 0',
		icon: Pilcrow,
		run: () => editor.chain().focus().setParagraph().run(),
		selectionMenu: true,
	},
	{
		id: 'heading',
		label: t('editor.heading'),
		shortcut: 'Ctrl Alt 1',
		icon: Heading2,
		run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
		selectionMenu: true,
	},
	{
		id: 'bullets',
		label: t('editor.bullets'),
		shortcut: 'Ctrl Shift 8',
		icon: List,
		run: () => editor.chain().focus().toggleBulletList().run(),
		selectionMenu: true,
	},
	{
		id: 'code',
		label: t('editor.code'),
		shortcut: 'Ctrl Alt C',
		icon: Code2,
		run: () => editor.chain().focus().toggleCodeBlock().run(),
		selectionMenu: true,
	},
	{
		id: 'divider',
		label: t('editor.divider'),
		shortcut: 'Ctrl Alt -',
		icon: Minus,
		run: () => editor.chain().focus().setHorizontalRule().run(),
		selectionMenu: false,
	},
	{
		id: 'bold',
		label: t('editor.bold'),
		shortcut: 'Ctrl B',
		icon: Bold,
		run: () => editor.chain().focus().toggleBold().run(),
		selectionMenu: true,
	},
	{
		id: 'italic',
		label: t('editor.italic'),
		shortcut: 'Ctrl I',
		icon: Italic,
		run: () => editor.chain().focus().toggleItalic().run(),
		selectionMenu: true,
	},
];

export const isModifiedShortcut = (
	event: KeyboardEvent,
	key: string,
	options: { alt?: boolean; shift?: boolean } = {}
): boolean => {
	const eventKey = event.key.toLowerCase();
	const targetKey = key.toLowerCase();
	const hasPrimaryModifier = event.ctrlKey || event.metaKey;

	return (
		hasPrimaryModifier &&
		event.altKey === Boolean(options.alt) &&
		event.shiftKey === Boolean(options.shift) &&
		eventKey === targetKey
	);
};

export const getActiveCommandName = (command: RichTextEditorTypes.Command): string => {
	if (command.id === 'heading') return 'heading';
	if (command.id === 'bullets') return 'bulletList';
	if (command.id === 'code') return 'codeBlock';
	return command.id;
};
