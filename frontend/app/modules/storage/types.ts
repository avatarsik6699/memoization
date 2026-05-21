export type NodeType = 'page' | 'folder';
export type StorageMode = 'local' | 'cloud';
export type ThemeMode = 'light' | 'dark' | 'system';
export type LanguageCode = 'ru' | 'en';

export type TiptapDocumentJSON = {
	type: 'doc';
	content?: Array<Record<string, unknown>>;
};

export type Page = {
	id: string;
	title: string;
	content: TiptapDocumentJSON;
	updatedAt: string;
};

export type TreeNode = {
	id: string;
	parentId: string | null;
	type: NodeType;
	title: string;
	orderIndex: number;
	updatedAt: string;
	children: TreeNode[];
};

export type CreateNodeInput = {
	id?: string;
	parentId: string | null;
	type: NodeType;
	title: string;
};

export type LocalNode = {
	id: string;
	parentId: string | null;
	type: NodeType;
	title: string;
	orderIndex: number;
	updatedAt: string;
	isDeleted: number;
};

export type LocalPage = {
	id: string;
	title: string;
	content: TiptapDocumentJSON;
	updatedAt: string;
};

export type LocalUpload = {
	id: string;
	pageId: string;
	name: string;
	mimeType: string;
	base64: string;
	createdAt: string;
};

export type PendingChange = {
	id: string;
	entity: 'node' | 'page' | 'upload';
	entityId: string;
	operation: 'create' | 'update' | 'delete' | 'move';
	payload: unknown;
	createdAt: string;
};

export type StorageAdapter = {
	mode: StorageMode;

	getPage(id: string): Promise<Page>;
	savePage(page: Page): Promise<void>;
	deletePage(id: string): Promise<void>;

	getTree(): Promise<TreeNode[]>;
	createNode(input: CreateNodeInput): Promise<TreeNode>;
	moveNode(id: string, newParentId: string | null): Promise<void>;
	renameNode(id: string, title: string): Promise<void>;
	deleteNode(id: string): Promise<void>;
};

export const emptyDocument: TiptapDocumentJSON = {
	type: 'doc',
	content: [{ type: 'paragraph' }],
};
