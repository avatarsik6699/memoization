import type { Editor } from '@tiptap/react';

export const hasActiveSlashTrigger = (editor: Editor): boolean => {
	const selection = editor.state.selection;
	if (!selection.empty) return false;

	const selectionFrom = selection.$from;
	if (selectionFrom.parentOffset < 1) return false;

	return selectionFrom.parent.textBetween(selectionFrom.parentOffset - 1, selectionFrom.parentOffset) === '/';
};

export const deleteActiveSlashTrigger = (editor: Editor): void => {
	if (!hasActiveSlashTrigger(editor)) return;

	const from = editor.state.selection.$from.pos - 1;
	editor
		.chain()
		.focus()
		.deleteRange({ from, to: from + 1 })
		.run();
};
