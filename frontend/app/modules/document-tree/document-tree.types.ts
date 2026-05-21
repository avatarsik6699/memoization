import type React from 'react';

import type { TreeNode } from '@/modules/storage/types';

export namespace DocumentTreeTypes {
	export type Props = {
		nodes: TreeNode[];
		activeNodeId: string | null;
		expandedIds: Set<string>;
		onToggle: (id: string) => void;
		onSelect: (node: TreeNode) => void;
		onCreate: (type: 'page' | 'folder', parentId: string | null) => void;
		onRename: (id: string, title: string) => void;
		onDelete: (id: string) => void;
		onMove: (id: string, parentId: string | null) => void;
	};

	export type TreeItemProps = Props & {
		node: TreeNode;
		depth: number;
		draggedId: string | null;
		setDraggedId: React.Dispatch<React.SetStateAction<string | null>>;
	};
}
