import { useState } from 'react';

export const useTreeDrag = () => {
	const [draggedId, setDraggedId] = useState<string | null>(null);

	return {
		draggedId,
		setDraggedId,
	};
};
