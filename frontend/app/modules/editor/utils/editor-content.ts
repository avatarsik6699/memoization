import type { TiptapDocumentJSON } from '@/modules/storage/types';
import { safeJson } from '@/shared/lib/safe-json';

export const isSameEditorContent = (left: unknown, right: TiptapDocumentJSON): boolean => {
	const serializedLeft = safeJson.stringify(left);
	const serializedRight = safeJson.stringify(right);

	return serializedLeft !== null && serializedLeft === serializedRight;
};
