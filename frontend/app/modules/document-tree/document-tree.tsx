import type React from 'react';

import { DocumentTreeActions } from './components/document-tree-actions';
import { TreeItem } from './components/tree-item';
import type { DocumentTreeTypes } from './document-tree.types';
import { useTreeDrag } from './hooks/use-tree-drag';

export const DocumentTree: React.FC<DocumentTreeTypes.Props> = props => {
	const treeDrag = useTreeDrag();

	return (
		<div className='document-tree'>
			<DocumentTreeActions onCreate={props.onCreate} />
			<div
				className='document-tree-root'
				onDragOver={event => event.preventDefault()}
				onDrop={event => {
					event.preventDefault();
					if (treeDrag.draggedId) props.onMove(treeDrag.draggedId, null);
					treeDrag.setDraggedId(null);
				}}
			>
				{props.nodes.map(node => (
					<TreeItem
						key={node.id}
						activeNodeId={props.activeNodeId}
						depth={0}
						draggedId={treeDrag.draggedId}
						expandedIds={props.expandedIds}
						node={node}
						nodes={props.nodes}
						onCreate={props.onCreate}
						onDelete={props.onDelete}
						onMove={props.onMove}
						onRename={props.onRename}
						onSelect={props.onSelect}
						onToggle={props.onToggle}
						setDraggedId={treeDrag.setDraggedId}
					/>
				))}
			</div>
		</div>
	);
};
