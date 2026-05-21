import { ChevronDown, ChevronRight, File, Folder, FolderPlus, Pencil, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

import type { DocumentTreeTypes } from '../document-tree.types';

export const TreeItem: React.FC<DocumentTreeTypes.TreeItemProps> = props => {
	const translation = useTranslation('editor');
	const [isRenaming, setIsRenaming] = useState(false);
	const isFolder = props.node.type === 'folder';
	const isExpanded = props.expandedIds.has(props.node.id);
	const isActive = props.activeNodeId === props.node.id;

	return (
		<div className='document-tree-item'>
			<div
				className={`tree-row group ${isActive ? 'tree-row-active' : ''}`}
				style={{ paddingLeft: `${props.depth * 14 + 6}px` }}
				draggable
				onDragStart={event => {
					event.stopPropagation();
					props.setDraggedId(props.node.id);
				}}
				onDragEnd={() => props.setDraggedId(null)}
				onDragOver={event => {
					if (isFolder) event.preventDefault();
				}}
				onDrop={event => {
					event.preventDefault();
					event.stopPropagation();
					if (props.draggedId && props.draggedId !== props.node.id && isFolder)
						props.onMove(props.draggedId, props.node.id);
					props.setDraggedId(null);
				}}
				onClickCapture={event => {
					if (!isFolder || !(event.target instanceof Element)) return;
					const actionButton = event.target.closest('[data-tree-action]');
					const action = actionButton?.getAttribute('data-tree-action');
					if (action !== 'add-page' && action !== 'add-folder') return;
					event.preventDefault();
					event.stopPropagation();
					props.onCreate(action === 'add-page' ? 'page' : 'folder', props.node.id);
				}}
			>
				<Button
					type='button'
					size='icon-xs'
					variant='ghost'
					disabled={!isFolder}
					onClick={event => {
						event.stopPropagation();
						props.onToggle(props.node.id);
					}}
				>
					{isFolder ? isExpanded ? <ChevronDown /> : <ChevronRight /> : <File />}
				</Button>
				<button
					type='button'
					className='tree-title'
					onMouseDown={event => {
						if (isFolder) return;
						event.preventDefault();
					}}
					onClick={event => {
						event.stopPropagation();
						if (isFolder) props.onToggle(props.node.id);
						else void props.onSelect(props.node);
					}}
				>
					{isFolder ? <Folder className='size-4' /> : null}
					{isRenaming ? (
						<input
							autoFocus
							defaultValue={props.node.title}
							onClick={event => event.stopPropagation()}
							onBlur={event => {
								props.onRename(props.node.id, event.currentTarget.value);
								setIsRenaming(false);
							}}
							onKeyDown={event => {
								if (event.key === 'Enter') event.currentTarget.blur();
								if (event.key === 'Escape') setIsRenaming(false);
							}}
						/>
					) : (
						<span>{props.node.title}</span>
					)}
				</button>
				<div className='tree-row-tools'>
					{isFolder ? (
						<>
							<Button
								type='button'
								size='icon-xs'
								variant='ghost'
								aria-label={translation.t('tree.addPage')}
								title={translation.t('tree.addPage')}
								data-tree-action='add-page'
								draggable={false}
								onPointerDown={event => event.stopPropagation()}
								onMouseDown={event => event.stopPropagation()}
								onDragStart={event => event.stopPropagation()}
								onClick={event => {
									event.preventDefault();
									event.stopPropagation();
									if (event.detail === 0) props.onCreate('page', props.node.id);
								}}
							>
								<Plus />
							</Button>
							<Button
								type='button'
								size='icon-xs'
								variant='ghost'
								aria-label={translation.t('tree.addFolder')}
								title={translation.t('tree.addFolder')}
								data-tree-action='add-folder'
								draggable={false}
								onPointerDown={event => event.stopPropagation()}
								onMouseDown={event => event.stopPropagation()}
								onDragStart={event => event.stopPropagation()}
								onClick={event => {
									event.preventDefault();
									event.stopPropagation();
									if (event.detail === 0) props.onCreate('folder', props.node.id);
								}}
							>
								<FolderPlus />
							</Button>
						</>
					) : null}
					<Button
						type='button'
						size='icon-xs'
						variant='ghost'
						aria-label={translation.t('tree.rename')}
						title={translation.t('tree.rename')}
						draggable={false}
						onPointerDown={event => event.stopPropagation()}
						onMouseDown={event => event.stopPropagation()}
						onDragStart={event => event.stopPropagation()}
						onClick={event => {
							event.stopPropagation();
							setIsRenaming(true);
						}}
					>
						<Pencil />
					</Button>
					<Button
						type='button'
						size='icon-xs'
						variant='ghost'
						aria-label={translation.t('tree.delete')}
						title={translation.t('tree.delete')}
						draggable={false}
						onPointerDown={event => event.stopPropagation()}
						onMouseDown={event => event.stopPropagation()}
						onDragStart={event => event.stopPropagation()}
						onClick={event => {
							event.stopPropagation();
							if (confirm(translation.t('tree.deleteConfirm', { title: props.node.title })))
								props.onDelete(props.node.id);
						}}
					>
						<Trash2 />
					</Button>
				</div>
			</div>
			{isFolder && isExpanded
				? props.node.children.map(child => (
						<TreeItem
							key={child.id}
							node={child}
							depth={props.depth + 1}
							activeNodeId={props.activeNodeId}
							expandedIds={props.expandedIds}
							draggedId={props.draggedId}
							setDraggedId={props.setDraggedId}
							onToggle={props.onToggle}
							onSelect={props.onSelect}
							onCreate={props.onCreate}
							onRename={props.onRename}
							onDelete={props.onDelete}
							onMove={props.onMove}
							nodes={[]}
						/>
					))
				: null}
		</div>
	);
};
