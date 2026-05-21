import type { RichTextEditorTypes } from '../rich-text-editor.types';

export const isVisibleDragHandleNode = (node: RichTextEditorTypes.DragHandleNode | null): boolean => {
	if (!node) return false;

	if (node.type.name === 'horizontalRule') return true;
	if (node.type.name === 'codeBlock') return true;
	if (node.isLeaf) return true;

	return node.textContent.trim().length > 0;
};
