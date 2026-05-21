import { useEffect, useRef, useState } from 'react';

export const useCommandMenuState = () => {
	const [slashOpen, setSlashOpen] = useState(false);
	const [activeCommandIndex, setActiveCommandIndex] = useState(0);
	const slashOpenRef = useRef(false);
	const activeCommandIndexRef = useRef(0);
	const menuRef = useRef<HTMLDivElement | null>(null);

	useEffect(
		function syncSlashOpenRefFx() {
			slashOpenRef.current = slashOpen;
		},
		[slashOpen]
	);

	useEffect(
		function syncActiveCommandIndexRefFx() {
			activeCommandIndexRef.current = activeCommandIndex;
		},
		[activeCommandIndex]
	);

	const changeActiveCommandIndex = (index: number) => {
		activeCommandIndexRef.current = index;
		setActiveCommandIndex(index);
	};

	const closeSlashMenu = () => {
		slashOpenRef.current = false;
		setSlashOpen(false);
	};

	const openSlashMenu = () => {
		slashOpenRef.current = true;
		activeCommandIndexRef.current = 0;
		setActiveCommandIndex(0);
		setSlashOpen(true);
	};

	return {
		activeCommandIndex,
		activeCommandIndexRef,
		changeActiveCommandIndex,
		closeSlashMenu,
		menuRef,
		openSlashMenu,
		setActiveCommandIndex,
		setSlashOpen,
		slashOpen,
		slashOpenRef,
	};
};
