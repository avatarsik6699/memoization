import type { TFunction } from 'i18next';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createLocalAdapter } from '@/modules/storage/local-adapter';
import { flattenTree } from '@/modules/storage/tree';
import { emptyDocument, type Page, type TiptapDocumentJSON, type TreeNode } from '@/modules/storage/types';
import { appDate } from '@/shared/lib/date';
import { useRouter } from '@/shared/lib/router';
import { safeLs } from '@/shared/lib/safe-ls';
import { useSearchParams } from '@/shared/lib/search-params';

import { defaultWorkspaceSearchParams, workspaceSearchParamsSchema } from '../constants/search-params';
import { workspaceNameStorageKey } from '../constants/storage';
import type { OfflineWorkspaceTypes } from '../offline-workspace.types';
import { collectSubtreeIds, filterTree, findNodePath, pageNodes } from '../utils/tree';

const createOptimisticNodeId = (type: OfflineWorkspaceTypes.TreeActionType): string => {
	const value =
		typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? crypto.randomUUID()
			: `${appDate.nowMs()}-${Math.random()}`;
	return `${type}_${value}`;
};

export const useOfflineWorkspace = (t: TFunction<'editor'>): OfflineWorkspaceTypes.WorkspaceController => {
	const router = useRouter();
	const workspaceSearchParams = useSearchParams({
		schema: workspaceSearchParamsSchema,
		fallback: defaultWorkspaceSearchParams,
	});
	const adapter = useMemo(() => createLocalAdapter(), []);
	const defaultWorkspaceName = t('workspace.defaultName');
	const [tree, setTree] = useState<TreeNode[]>([]);
	const [activePage, setActivePage] = useState<Page | null>(null);
	const [draft, setDraft] = useState<TiptapDocumentJSON>(emptyDocument);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
	const [workspaceName, setWorkspaceName] = useState(defaultWorkspaceName);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [saveStatus, setSaveStatus] = useState<OfflineWorkspaceTypes.SaveStatus>('idle');
	const latestDraft = useRef<TiptapDocumentJSON>(emptyDocument);
	const activePageRef = useRef<Page | null>(null);
	const locallyLoadedRouteId = useRef<string | null>(null);
	const treeActionQueue = useRef<Promise<void>>(Promise.resolve());
	const treeMutationVersion = useRef(0);
	const searchQuery = workspaceSearchParams.data.q;

	const visibleTree = useMemo(() => filterTree(tree, searchQuery), [searchQuery, tree]);
	const activePath = useMemo(
		() => (activePage ? findNodePath(tree, activePage.id).map(node => node.title) : []),
		[activePage, tree]
	);
	const documentContext = activePath.length > 1 ? activePath.slice(0, -1).join(' / ') : workspaceName;

	const refreshTree = useCallback(async () => {
		const nextTree = await adapter.getTree();
		setTree(nextTree);
		return nextTree;
	}, [adapter]);

	const loadPage = useCallback(
		async (pageId: string) => {
			const page = await adapter.getPage(pageId);
			activePageRef.current = page;
			latestDraft.current = page.content;
			setActivePage(page);
			setDraft(page.content);
			setSaveStatus('saved');
		},
		[adapter]
	);

	const flush = useCallback(async () => {
		const current = activePageRef.current;
		if (!current) return;

		setSaveStatus('saving');
		try {
			const nextPage = { ...current, content: latestDraft.current };
			await adapter.savePage(nextPage);
			activePageRef.current = nextPage;
			setActivePage(nextPage);
			setSaveStatus('saved');
			await refreshTree();
		} catch {
			setSaveStatus('error');
		}
	}, [adapter, refreshTree]);

	const handleEditorChange = useCallback((content: TiptapDocumentJSON) => {
		latestDraft.current = content;
		setDraft(content);
		setSaveStatus('dirty');
	}, []);

	const handleEditorFlush = useCallback(() => {
		void flush();
	}, [flush]);

	useEffect(
		function initializeWorkspaceFx() {
			let active = true;

			const initWorkspace = async () => {
				const startedMutationVersion = treeMutationVersion.current;
				const storedName = safeLs.get(workspaceNameStorageKey);
				if (storedName?.trim()) setWorkspaceName(storedName);

				const nextTree = await adapter.getTree();
				if (!active) return;
				if (startedMutationVersion !== treeMutationVersion.current) return;

				setTree(nextTree);

				setExpandedIds(
					new Set(
						flattenTree(nextTree)
							.filter(node => node.type === 'folder')
							.map(node => node.id)
					)
				);

				const selectedId = router.params.nodeId ?? pageNodes(nextTree)[0]?.id;
				if (selectedId) {
					if (locallyLoadedRouteId.current === selectedId) {
						locallyLoadedRouteId.current = null;
						return;
					}
					await loadPage(selectedId);
				}
			};

			void initWorkspace();
			return () => {
				active = false;
			};
		},
		[adapter, loadPage, router.params.nodeId]
	);

	useEffect(
		function expandSearchMatchesFx() {
			if (searchQuery.trim()) {
				setExpandedIds(current => {
					const next = new Set(current);
					flattenTree(visibleTree)
						.filter(node => node.type === 'folder')
						.forEach(node => next.add(node.id));
					return next;
				});
			}
		},
		[searchQuery, visibleTree]
	);

	useEffect(
		function debouncedAutosaveFx() {
			if (saveStatus !== 'dirty') return;

			const timer = window.setTimeout(() => void flush(), 1500);
			return () => window.clearTimeout(timer);
		},
		[flush, saveStatus]
	);

	useEffect(
		function flushOnUnmountFx() {
			return () => {
				void flush();
			};
		},
		[flush]
	);

	const selectNode = async (node: TreeNode) => {
		if (node.type !== 'page') return;

		const previousPage = activePageRef.current;
		const previousDraft = latestDraft.current;
		if (saveStatus === 'dirty' && previousPage) {
			setSaveStatus('saving');
			try {
				await adapter.savePage({ ...previousPage, content: previousDraft });
			} catch {
				setSaveStatus('error');
				return;
			}
		}
		locallyLoadedRouteId.current = node.id;
		router.push({ to: router.routes.node({ nodeId: node.id }) });
		await loadPage(node.id);
		setMobileOpen(false);
	};

	const createNode = async (type: OfflineWorkspaceTypes.TreeActionType, parentId: string | null) => {
		treeMutationVersion.current += 1;
		const createdAt = appDate.nowIso();
		const node: TreeNode = {
			id: createOptimisticNodeId(type),
			parentId,
			type,
			title: type === 'folder' ? t('tree.untitledFolder') : t('tree.untitledPage'),
			orderIndex: 0,
			updatedAt: createdAt,
			children: [],
		};
		const appendNode = (nodes: TreeNode[]): TreeNode[] => {
			if (!parentId) return [...nodes, node];
			return nodes.map(item => {
				if (item.id === parentId) return { ...item, children: [...item.children, node] };
				if (item.children.length === 0) return item;
				return { ...item, children: appendNode(item.children) };
			});
		};

		if (parentId) setExpandedIds(current => new Set(current).add(parentId));
		setTree(currentTree => appendNode(currentTree));
		if (type === 'page') {
			const createdPage = { id: node.id, title: node.title, content: emptyDocument, updatedAt: node.updatedAt };
			activePageRef.current = createdPage;
			latestDraft.current = createdPage.content;
			setActivePage(createdPage);
			setDraft(createdPage.content);
			setSaveStatus('saved');
		} else {
			setExpandedIds(current => new Set(current).add(node.id));
		}

		const persistNode = async () => {
			await adapter.createNode({
				id: node.id,
				type,
				parentId,
				title: node.title,
			});
		};
		const queuedAction = treeActionQueue.current.then(persistNode, persistNode);
		if (type === 'page') {
			void queuedAction.then(() => {
				if (activePageRef.current?.id === node.id) router.push({ to: router.routes.node({ nodeId: node.id }) });
			});
		}
		treeActionQueue.current = queuedAction.catch(() => {
			if (type === 'page') setSaveStatus('error');
		});
		await queuedAction.catch(() => {
			if (type === 'page') setSaveStatus('error');
		});
	};

	const renameNode = async (id: string, title: string) => {
		await adapter.renameNode(id, title);
		if (activePage?.id === id) {
			const nextPage = { ...activePage, title: title.trim() || t('tree.untitledPage') };
			activePageRef.current = nextPage;
			setActivePage(nextPage);
		}
		await refreshTree();
	};

	const updateActivePageTitle = (title: string) => {
		const current = activePageRef.current;
		if (!current) return;

		const updateTreeTitle = (nodes: TreeNode[]): TreeNode[] =>
			nodes.map(node => {
				if (node.id === current.id) return { ...node, title };
				if (node.children.length === 0) return node;
				return { ...node, children: updateTreeTitle(node.children) };
			});

		const nextPage = { ...current, title };
		activePageRef.current = nextPage;
		setActivePage(nextPage);
		setTree(currentTree => updateTreeTitle(currentTree));
		setSaveStatus('dirty');
	};

	const deleteNode = async (id: string) => {
		const deletedIds = collectSubtreeIds(tree, id);
		await adapter.deleteNode(id);
		const nextTree = await refreshTree();
		if (activePage?.id && deletedIds.has(activePage.id)) {
			const nextPage = pageNodes(nextTree)[0];
			if (nextPage) router.push({ to: router.routes.node({ nodeId: nextPage.id }) });
			else {
				setActivePage(null);
				router.push({ to: router.routes.root() });
			}
		}
	};

	const moveNode = async (id: string, parentId: string | null) => {
		await adapter.moveNode(id, parentId);
		if (parentId) setExpandedIds(current => new Set(current).add(parentId));
		await refreshTree();
	};

	const storeWorkspaceName = (value: string, translate: TFunction<'editor'>) => {
		const nextName = value.trim() || translate('workspace.defaultName');
		setWorkspaceName(nextName);
		safeLs.set(workspaceNameStorageKey, nextName);
	};

	const setSearchQuery = (value: string) => {
		if (value.trim()) {
			workspaceSearchParams.set({ key: 'q', value, options: { replace: true } });
			return;
		}
		workspaceSearchParams.remove({ key: 'q', options: { replace: true } });
	};

	return {
		activePage,
		activePath,
		createNode,
		defaultWorkspaceName,
		deleteNode,
		documentContext,
		draft,
		expandedIds,
		flush,
		handleEditorChange,
		handleEditorFlush,
		mobileOpen,
		moveNode,
		renameNode,
		saveStatus,
		searchQuery,
		selectNode,
		setExpandedIds,
		setMobileOpen,
		setSearchQuery,
		setWorkspaceName,
		storeWorkspaceName,
		updateActivePageTitle,
		visibleTree,
		workspaceName,
	};
};
