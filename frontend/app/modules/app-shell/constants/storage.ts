import type { SafeLsTypes } from '@/shared/lib/safe-ls';

const isString = (value: unknown): value is string => typeof value === 'string';

export const workspaceNameStorageKey = {
	key: 'memoization.workspaceName',
	version: 1,
	guard: isString,
} satisfies SafeLsTypes.Key<string>;
