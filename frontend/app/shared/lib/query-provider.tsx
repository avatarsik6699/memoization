import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type React from 'react';
import type { PropsWithChildren } from 'react';

import { queryClient } from '@shared/api/query-client';
import { runtime } from '@shared/config/runtime';

export const QueryProvider: React.FC<PropsWithChildren> = props => {
	return (
		<QueryClientProvider client={queryClient}>
			{props.children}
			{runtime.isDev ? <ReactQueryDevtools buttonPosition='bottom-right' initialIsOpen={false} /> : null}
		</QueryClientProvider>
	);
};
