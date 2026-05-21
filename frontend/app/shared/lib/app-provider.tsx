import { ThemeProvider } from 'next-themes';
import type React from 'react';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '@shared/lib/i18n';
import { QueryProvider } from '@shared/lib/query-provider';

export const AppProvider: React.FC<PropsWithChildren> = props => {
	return (
		<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
			<I18nextProvider i18n={i18n}>
				<QueryProvider>{props.children}</QueryProvider>
			</I18nextProvider>
		</ThemeProvider>
	);
};
