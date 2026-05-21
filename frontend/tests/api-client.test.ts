import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { api } from '@shared/api/client';
import { authQueryKeys } from '@shared/api/keys';
import { queryClient } from '@shared/api/query-client';
import { jwtService } from '@shared/services/jwt-service';
import type { components } from '@shared/types/schema';

type TokenPair = components['schemas']['TokenPair'];

function createJsonResponse(body: unknown, init: ResponseInit): Response {
	return new Response(JSON.stringify(body), {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(init.headers ?? {}),
		},
	});
}

function createStorage(): Storage {
	const values = new Map<string, string>();

	return {
		get length() {
			return values.size;
		},
		clear: vi.fn(() => values.clear()),
		getItem: vi.fn((key: string) => values.get(key) ?? null),
		key: vi.fn((index: number) => Array.from(values.keys())[index] ?? null),
		removeItem: vi.fn((key: string) => {
			values.delete(key);
		}),
		setItem: vi.fn((key: string, value: string) => {
			values.set(key, value);
		}),
	};
}

const originalTokens = {
	access_token: 'expired-access',
	refresh_token: 'refresh-token',
	token_type: 'bearer',
} satisfies TokenPair;

const refreshedTokens = {
	access_token: 'fresh-access',
	refresh_token: 'fresh-refresh',
	token_type: 'bearer',
} satisfies TokenPair;

describe('api client', () => {
	beforeEach(() => {
		vi.stubGlobal('window', { localStorage: createStorage() });
		queryClient.clear();
		jwtService.set(queryClient, originalTokens);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
		queryClient.clear();
	});

	it('refreshes tokens once and retries the original request after 401', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(createJsonResponse({ detail: 'expired' }, { status: 401 }))
			.mockResolvedValueOnce(createJsonResponse(refreshedTokens, { status: 200 }))
			.mockResolvedValueOnce(
				createJsonResponse(
					{
						id: 'user-id',
						email: 'demo@memoization.local',
						role: 'user',
						is_active: true,
						consent_152fz: true,
						created_at: '2026-05-19T00:00:00Z',
					},
					{ status: 200 }
				)
			);
		vi.stubGlobal('fetch', fetchMock);

		const user = await api.get('/api/v1/public/auth/me');

		expect(user.email).toBe('demo@memoization.local');
		expect(fetchMock).toHaveBeenCalledTimes(3);
		expect(fetchMock.mock.calls[1][0]).toBe('http://localhost:8000/api/v1/public/auth/refresh');
		expect((fetchMock.mock.calls[2][1]?.headers as Headers).get('Authorization')).toBe('Bearer fresh-access');
		expect(queryClient.getQueryData(authQueryKeys.token)).toEqual(refreshedTokens);
	});
});
