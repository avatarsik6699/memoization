import { useEffect, useState } from 'react';

import type { OfflineWorkspaceTypes } from '../offline-workspace.types';

export const useInstallPrompt = () => {
	const [installPrompt, setInstallPrompt] = useState<OfflineWorkspaceTypes.BeforeInstallPromptEvent | null>(null);

	useEffect(function bindBeforeInstallPromptFx() {
		const onBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			setInstallPrompt(event as OfflineWorkspaceTypes.BeforeInstallPromptEvent);
		};

		window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
		return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
	}, []);

	const promptInstall = () => {
		if (!installPrompt) return;

		void installPrompt.prompt();
		setInstallPrompt(null);
	};

	return {
		installPrompt,
		promptInstall,
	};
};
