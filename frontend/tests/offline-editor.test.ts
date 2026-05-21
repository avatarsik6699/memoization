import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildTree, flattenTree } from '@/modules/storage/tree';
import type { LocalNode } from '@/modules/storage/types';

const nodes: LocalNode[] = [
	{
		id: 'page-2',
		parentId: 'folder-1',
		type: 'page',
		title: 'Nested',
		orderIndex: 1,
		updatedAt: '2026-05-20T00:00:00.000Z',
		isDeleted: 0,
	},
	{
		id: 'folder-1',
		parentId: null,
		type: 'folder',
		title: 'Folder',
		orderIndex: 0,
		updatedAt: '2026-05-20T00:00:00.000Z',
		isDeleted: 0,
	},
	{
		id: 'page-1',
		parentId: null,
		type: 'page',
		title: 'Root page',
		orderIndex: 1,
		updatedAt: '2026-05-20T00:00:00.000Z',
		isDeleted: 0,
	},
	{
		id: 'deleted-page',
		parentId: null,
		type: 'page',
		title: 'Deleted',
		orderIndex: 2,
		updatedAt: '2026-05-20T00:00:00.000Z',
		isDeleted: 1,
	},
];

describe('offline editor storage tree', () => {
	it('builds ordered nested trees without deleted nodes', () => {
		const tree = buildTree(nodes);

		expect(tree).toHaveLength(2);
		expect(tree[0]?.id).toBe('folder-1');
		expect(tree[0]?.children[0]?.id).toBe('page-2');
		expect(flattenTree(tree).map(node => node.id)).toEqual(['folder-1', 'page-2', 'page-1']);
	});
});

describe('pwa assets', () => {
	it('declares the app start url and offline fallback', () => {
		const manifest = JSON.parse(readFileSync(join(process.cwd(), 'public/manifest.webmanifest'), 'utf8')) as {
			start_url: string;
			display: string;
		};
		const offline = readFileSync(join(process.cwd(), 'public/offline.html'), 'utf8');

		expect(manifest.start_url).toBe('/');
		expect(manifest.display).toBe('standalone');
		expect(offline).toContain('memoization offline');
	});
});
