import { flattenTree } from '@/modules/storage/tree';
import type { TreeNode } from '@/modules/storage/types';

export const pageNodes = (nodes: TreeNode[]): TreeNode[] => flattenTree(nodes).filter(node => node.type === 'page');

export const collectSubtreeIds = (nodes: TreeNode[], rootId: string): Set<string> => {
	for (const node of nodes) {
		if (node.id === rootId) return new Set(flattenTree([node]).map(item => item.id));

		const nested = collectSubtreeIds(node.children, rootId);
		if (nested.size > 0) return nested;
	}

	return new Set();
};

export const filterTree = (nodes: TreeNode[], query: string): TreeNode[] => {
	const normalizedQuery = query.trim().toLocaleLowerCase();
	if (!normalizedQuery) return nodes;

	return nodes.flatMap(node => {
		const children = filterTree(node.children, normalizedQuery);
		const matches = node.title.toLocaleLowerCase().includes(normalizedQuery);
		return matches || children.length > 0 ? [{ ...node, children }] : [];
	});
};

export const findNodePath = (nodes: TreeNode[], nodeId: string, parents: TreeNode[] = []): TreeNode[] => {
	for (const node of nodes) {
		const path = [...parents, node];
		if (node.id === nodeId) return path;

		const childPath = findNodePath(node.children, nodeId, path);
		if (childPath.length > 0) return childPath;
	}

	return [];
};
