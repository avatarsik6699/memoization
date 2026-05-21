import type React from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from 'react-router';

import { appError } from '@shared/lib/app-error';
import { AppProvider } from '@shared/lib/app-provider';
import { globalErrorNotifier } from '@shared/lib/global-error-notifier';
import { ErrorState } from '@shared/ui/error-state';

import './styles/app.css';

const DocumentShell: React.FC<{ children: React.ReactNode }> = props => (
	<html lang='en' suppressHydrationWarning>
		<head>
			<meta charSet='utf-8' />
			<meta name='viewport' content='width=device-width, initial-scale=1' />
			<meta name='theme-color' content='#1f2937' />
			<link rel='manifest' href='/manifest.webmanifest' />
			<Meta />
			<Links />
		</head>
		<body>
			<AppProvider>{props.children}</AppProvider>
			<ScrollRestoration />
			<Scripts />
		</body>
	</html>
);

const App: React.FC = () => (
	<DocumentShell>
		<Outlet />
	</DocumentShell>
);

export default App;

export const ErrorBoundary: React.FC = () => {
	const translation = useTranslation('errors');
	const routeError = useRouteError();
	const error = appError.toUiError(routeError);

	useEffect(
		function notifyRouteErrorFx() {
			globalErrorNotifier.notifyError(error.message);
		},
		[error.message]
	);

	return (
		<DocumentShell>
			<main className='error-screen'>
				<ErrorState title={translation.t('applicationError')} error={error} />
			</main>
		</DocumentShell>
	);
};
