import { appDate } from '@/shared/lib/date';

import { createLocalDatabase, type NotesLocalDatabase } from './db';
import { buildTree } from './tree';
import {
	emptyDocument,
	type CreateNodeInput,
	type LocalNode,
	type Page,
	type StorageAdapter,
	type TreeNode,
} from './types';

function id(prefix: string) {
	const value =
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? crypto.randomUUID()
			: `${appDate.nowMs()}-${Math.random()}`;
	return `${prefix}_${value}`;
}

export class LocalAdapter implements StorageAdapter {
	mode = 'local' as const;

	constructor(private readonly db: NotesLocalDatabase = createLocalDatabase()) {}

	async ensureDefaultWorkspace(): Promise<void> {
		const count = await this.db.nodes.where('isDeleted').equals(0).count();
		if (count > 0) return;

		const createdAt = appDate.nowIso();
		const architectureId = id('folder');
		const welcomeId = id('page');
		const apiId = id('page');
		const dataId = id('page');
		await this.db.transaction('rw', this.db.nodes, this.db.pages, this.db.pending_changes, async () => {
			await this.db.nodes.bulkAdd([
				{
					id: architectureId,
					parentId: null,
					type: 'folder',
					title: 'Architecture',
					orderIndex: 0,
					updatedAt: createdAt,
					isDeleted: 0,
				},
				{
					id: welcomeId,
					parentId: architectureId,
					type: 'page',
					title: 'System Overview',
					orderIndex: 0,
					updatedAt: createdAt,
					isDeleted: 0,
				},
				{
					id: apiId,
					parentId: architectureId,
					type: 'page',
					title: 'API Contract',
					orderIndex: 1,
					updatedAt: createdAt,
					isDeleted: 0,
				},
				{
					id: dataId,
					parentId: architectureId,
					type: 'page',
					title: 'Data Model',
					orderIndex: 2,
					updatedAt: createdAt,
					isDeleted: 0,
				},
			]);
			await this.db.pages.add({
				id: welcomeId,
				title: 'System Overview',
				content: {
					type: 'doc',
					content: [
						{
							type: 'blockquote',
							content: [
								{
									type: 'paragraph',
									content: [
										{
											type: 'text',
											text: 'Key pattern — Storage Adapter: components never know where data lives. Local ↔ Cloud switching is fully transparent at login.',
										},
									],
								},
							],
						},
						{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Stack' }] },
						{
							type: 'bulletList',
							content: [
								{
									type: 'listItem',
									content: [
										{ type: 'paragraph', content: [{ type: 'text', text: 'React 19 + React Router 7 (SSR)' }] },
									],
								},
								{
									type: 'listItem',
									content: [
										{ type: 'paragraph', content: [{ type: 'text', text: 'FastAPI + PostgreSQL 18 + Redis 8' }] },
									],
								},
								{
									type: 'listItem',
									content: [
										{ type: 'paragraph', content: [{ type: 'text', text: 'Dexie.js (IndexedDB) · TanStack Query' }] },
									],
								},
								{
									type: 'listItem',
									content: [
										{ type: 'paragraph', content: [{ type: 'text', text: 'Workbox 7 + Service Worker (PWA)' }] },
									],
								},
							],
						},
						{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Storage Adapter' }] },
					],
				},
				updatedAt: createdAt,
			});
			await this.db.pages.bulkAdd([
				{ id: apiId, title: 'API Contract', content: emptyDocument, updatedAt: createdAt },
				{ id: dataId, title: 'Data Model', content: emptyDocument, updatedAt: createdAt },
			]);
			await this.recordChange('node', welcomeId, 'create', { seeded: true });
		});
	}

	async getPage(pageId: string): Promise<Page> {
		const page = await this.db.pages.get(pageId);
		if (!page) throw new Error(`Page not found: ${pageId}`);
		return page;
	}

	async savePage(page: Page): Promise<void> {
		const updatedAt = appDate.nowIso();
		await this.db.transaction('rw', this.db.pages, this.db.nodes, this.db.pending_changes, async () => {
			await this.db.pages.put({ ...page, updatedAt });
			await this.db.nodes.update(page.id, { title: page.title, updatedAt });
			await this.recordChange('page', page.id, 'update', { updatedAt });
		});
	}

	async deletePage(pageId: string): Promise<void> {
		await this.db.transaction('rw', this.db.pages, this.db.nodes, this.db.pending_changes, async () => {
			await this.db.pages.delete(pageId);
			await this.db.nodes.update(pageId, { isDeleted: 1, updatedAt: appDate.nowIso() });
			await this.recordChange('page', pageId, 'delete', {});
		});
	}

	async getTree(): Promise<TreeNode[]> {
		await this.ensureDefaultWorkspace();
		return buildTree(await this.db.nodes.toArray());
	}

	async createNode(input: CreateNodeInput): Promise<TreeNode> {
		const createdAt = appDate.nowIso();
		const nodeId = input.id ?? id(input.type);
		const siblingCount = (await this.db.nodes.toArray()).filter(
			node => node.parentId === input.parentId && !node.isDeleted
		).length;
		const node: LocalNode = {
			id: nodeId,
			parentId: input.parentId,
			type: input.type,
			title: input.title.trim() || (input.type === 'folder' ? 'Новая папка' : 'Новая страница'),
			orderIndex: siblingCount,
			updatedAt: createdAt,
			isDeleted: 0,
		};

		await this.db.transaction('rw', this.db.nodes, this.db.pages, this.db.pending_changes, async () => {
			await this.db.nodes.put(node);
			if (input.type === 'page') {
				const existingPage = await this.db.pages.get(nodeId);
				await this.db.pages.put({
					id: nodeId,
					title: existingPage?.title ?? node.title,
					content: existingPage?.content ?? emptyDocument,
					updatedAt: existingPage?.updatedAt ?? createdAt,
				});
			}
			await this.recordChange('node', nodeId, 'create', node);
		});

		return { ...node, children: [] };
	}

	async moveNode(nodeId: string, newParentId: string | null): Promise<void> {
		const updatedAt = appDate.nowIso();
		const siblings = (await this.db.nodes.toArray()).filter(node => node.parentId === newParentId && !node.isDeleted);
		await this.db.transaction('rw', this.db.nodes, this.db.pending_changes, async () => {
			await this.db.nodes.update(nodeId, { parentId: newParentId, orderIndex: siblings.length, updatedAt });
			await this.recordChange('node', nodeId, 'move', { parentId: newParentId });
		});
	}

	async renameNode(nodeId: string, title: string): Promise<void> {
		const updatedAt = appDate.nowIso();
		const nextTitle = title.trim() || 'Без названия';
		await this.db.transaction('rw', this.db.nodes, this.db.pages, this.db.pending_changes, async () => {
			await this.db.nodes.update(nodeId, { title: nextTitle, updatedAt });
			const page = await this.db.pages.get(nodeId);
			if (page) await this.db.pages.update(nodeId, { title: nextTitle, updatedAt });
			await this.recordChange('node', nodeId, 'update', { title: nextTitle });
		});
	}

	async deleteNode(nodeId: string): Promise<void> {
		const allNodes = await this.db.nodes.toArray();
		const ids = new Set<string>([nodeId]);
		let changed = true;
		while (changed) {
			changed = false;
			for (const node of allNodes) {
				if (node.parentId && ids.has(node.parentId) && !ids.has(node.id)) {
					ids.add(node.id);
					changed = true;
				}
			}
		}

		const updatedAt = appDate.nowIso();
		await this.db.transaction('rw', this.db.nodes, this.db.pages, this.db.pending_changes, async () => {
			await Promise.all([...ids].map(idValue => this.db.nodes.update(idValue, { isDeleted: 1, updatedAt })));
			await this.db.pages.bulkDelete([...ids]);
			await this.recordChange('node', nodeId, 'delete', { ids: [...ids] });
		});
	}

	private async recordChange(
		entity: 'node' | 'page' | 'upload',
		entityId: string,
		operation: 'create' | 'update' | 'delete' | 'move',
		payload: unknown
	) {
		await this.db.pending_changes.add({
			id: id('change'),
			entity,
			entityId,
			operation,
			payload,
			createdAt: appDate.nowIso(),
		});
	}
}

export function createLocalAdapter() {
	return new LocalAdapter();
}
