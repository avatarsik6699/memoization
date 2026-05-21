import Dexie, { type EntityTable } from 'dexie';

import type { LocalNode, LocalPage, LocalUpload, PendingChange } from './types';

export type NotesLocalDatabase = Dexie & {
	nodes: EntityTable<LocalNode, 'id'>;
	pages: EntityTable<LocalPage, 'id'>;
	uploads: EntityTable<LocalUpload, 'id'>;
	pending_changes: EntityTable<PendingChange, 'id'>;
};

export function createLocalDatabase(): NotesLocalDatabase {
	const db = new Dexie('notesapp_v1') as NotesLocalDatabase;

	db.version(1).stores({
		nodes: 'id, parentId, type, orderIndex, updatedAt, isDeleted',
		pages: 'id, updatedAt',
		uploads: 'id, pageId',
		pending_changes: 'id, createdAt',
	});

	return db;
}
