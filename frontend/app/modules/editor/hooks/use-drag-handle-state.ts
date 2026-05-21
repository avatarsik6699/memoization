import { useEffect, useRef, useState } from 'react';

export const useDragHandleState = () => {
	const [dragHandleLocked, setDragHandleLocked] = useState(false);
	const [dragHandleVisible, setDragHandleVisible] = useState(false);
	const dragHandleLockedRef = useRef(false);

	useEffect(
		function syncDragHandleLockedRefFx() {
			dragHandleLockedRef.current = dragHandleLocked;
		},
		[dragHandleLocked]
	);

	const lockDragHandle = () => {
		dragHandleLockedRef.current = true;
		setDragHandleLocked(true);
	};

	const unlockDragHandle = () => {
		dragHandleLockedRef.current = false;
		setDragHandleLocked(false);
		document.querySelectorAll('.editor-dropcursor').forEach(element => element.remove());
	};

	return {
		dragHandleLocked,
		dragHandleLockedRef,
		dragHandleVisible,
		lockDragHandle,
		setDragHandleVisible,
		unlockDragHandle,
	};
};
