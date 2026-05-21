import type { Editor } from '@tiptap/react';
import type { TFunction } from 'i18next';
import type { LucideIcon } from 'lucide-react';

import type { TiptapDocumentJSON } from '@/modules/storage/types';

export namespace RichTextEditorTypes {
	export type Props = {
		content: TiptapDocumentJSON;
		onChange: (content: TiptapDocumentJSON) => void;
		onFlush: () => void;
	};

	export type Command = {
		id: string;
		label: string;
		shortcut: string;
		icon: LucideIcon;
		run: () => boolean;
		selectionMenu: boolean;
	};

	export type DragHandleNode = {
		type: {
			name: string;
		};
		isLeaf: boolean;
		textContent: string;
	};

	export type CommandFactory = (editor: Editor, t: TFunction<'editor'>) => Command[];
}
