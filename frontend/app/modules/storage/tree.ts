import type { LocalNode, TreeNode } from './types';

export function buildTree(nodes: LocalNode[]): TreeNode[] {
	const active = nodes
		.filter(node => !node.isDeleted)
		.sort((a, b) => a.orderIndex - b.orderIndex || a.title.localeCompare(b.title));
	const byId = new Map<string, TreeNode>();
	const roots: TreeNode[] = [];

	for (const node of active) {
		byId.set(node.id, { ...node, children: [] });
	}

	for (const node of byId.values()) {
		if (node.parentId && byId.has(node.parentId)) {
			byId.get(node.parentId)?.children.push(node);
		} else {
			roots.push(node);
		}
	}

	const sortChildren = (items: TreeNode[]) => {
		items.sort((a, b) => a.orderIndex - b.orderIndex || a.title.localeCompare(b.title));
		items.forEach(item => sortChildren(item.children));
	};
	sortChildren(roots);

	return roots;
}

export function flattenTree(nodes: TreeNode[]): TreeNode[] {
	return nodes.flatMap(node => [node, ...flattenTree(node.children)]);
}
