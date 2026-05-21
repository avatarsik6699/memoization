import DragHandle from '@tiptap/extension-drag-handle-react';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { GripVertical } from 'lucide-react';
import type React from 'react';
import { type KeyboardEvent as ReactKeyboardEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { TiptapDocumentJSON } from '@/modules/storage/types';

import { SelectionMenu } from './components/selection-menu';
import { SlashCommandMenu } from './components/slash-command-menu';
import { useCommandMenuState } from './hooks/use-command-menu-state';
import { useDragHandleState } from './hooks/use-drag-handle-state';
import type { RichTextEditorTypes } from './rich-text-editor.types';
import { getEditorCommands, isModifiedShortcut } from './utils/commands';
import { isVisibleDragHandleNode } from './utils/drag-handle';
import { isSameEditorContent } from './utils/editor-content';
import { deleteActiveSlashTrigger, hasActiveSlashTrigger } from './utils/slash-trigger';

export const RichTextEditor: React.FC<RichTextEditorTypes.Props> = props => {
	const translation = useTranslation('editor');
	const editorRef = useRef<Editor | null>(null);
	const commandMenuState = useCommandMenuState();
	const dragHandleState = useDragHandleState();
	const extensions = useMemo(
		() => [
			StarterKit.configure({
				dropcursor: {
					color: false,
					width: 2,
					class: 'editor-dropcursor',
				},
			}),
			Image.configure({ inline: false, allowBase64: true }),
			Placeholder.configure({ placeholder: translation.t('editor.placeholder') }),
		],
		[translation.t]
	);
	const editor = useEditor({
		extensions,
		content: props.content,
		immediatelyRender: false,
		onUpdate: params => {
			const json = params.editor.getJSON() as TiptapDocumentJSON;
			props.onChange(json);
			const hasSlashTrigger = hasActiveSlashTrigger(params.editor);
			commandMenuState.slashOpenRef.current = hasSlashTrigger;
			commandMenuState.activeCommandIndexRef.current = 0;
			commandMenuState.setSlashOpen(hasSlashTrigger);
			commandMenuState.setActiveCommandIndex(0);
		},
		onSelectionUpdate: params => {
			const hasSlashTrigger = hasActiveSlashTrigger(params.editor);
			commandMenuState.slashOpenRef.current = hasSlashTrigger;
			commandMenuState.activeCommandIndexRef.current = 0;
			commandMenuState.setSlashOpen(hasSlashTrigger);
			commandMenuState.setActiveCommandIndex(0);
		},
		editorProps: {
			attributes: {
				class: 'editor-prose',
			},
			handleKeyDown: (_view, event) => {
				const activeEditor = editorRef.current;
				if (!activeEditor) return false;
				const commands = getEditorCommands(activeEditor, translation.t);

				if (commandMenuState.slashOpenRef.current || hasActiveSlashTrigger(activeEditor)) {
					if (event.key === 'ArrowDown') {
						event.preventDefault();
						const nextIndex = (commandMenuState.activeCommandIndexRef.current + 1) % commands.length;
						commandMenuState.activeCommandIndexRef.current = nextIndex;
						commandMenuState.setActiveCommandIndex(nextIndex);
						return true;
					}
					if (event.key === 'ArrowUp') {
						event.preventDefault();
						const nextIndex = (commandMenuState.activeCommandIndexRef.current - 1 + commands.length) % commands.length;
						commandMenuState.activeCommandIndexRef.current = nextIndex;
						commandMenuState.setActiveCommandIndex(nextIndex);
						return true;
					}
					if (event.key === 'Home') {
						event.preventDefault();
						commandMenuState.activeCommandIndexRef.current = 0;
						commandMenuState.setActiveCommandIndex(0);
						return true;
					}
					if (event.key === 'End') {
						event.preventDefault();
						commandMenuState.activeCommandIndexRef.current = commands.length - 1;
						commandMenuState.setActiveCommandIndex(commands.length - 1);
						return true;
					}
					if (event.key === 'Enter') {
						event.preventDefault();
						deleteActiveSlashTrigger(activeEditor);
						commands[commandMenuState.activeCommandIndexRef.current]?.run();
						commandMenuState.slashOpenRef.current = false;
						commandMenuState.setSlashOpen(false);
						return true;
					}
					if (/^[1-9]$/.test(event.key)) {
						const command = commands[Number(event.key) - 1];
						if (command) {
							event.preventDefault();
							deleteActiveSlashTrigger(activeEditor);
							command.run();
							commandMenuState.slashOpenRef.current = false;
							commandMenuState.setSlashOpen(false);
							return true;
						}
					}
				}

				if (event.key === 'Escape') {
					commandMenuState.slashOpenRef.current = false;
					commandMenuState.setSlashOpen(false);
					return true;
				}
				if (isModifiedShortcut(event, '/')) {
					event.preventDefault();
					commandMenuState.slashOpenRef.current = true;
					commandMenuState.activeCommandIndexRef.current = 0;
					commandMenuState.setActiveCommandIndex(0);
					commandMenuState.setSlashOpen(true);
					return true;
				}
				if (isModifiedShortcut(event, '0', { alt: true })) {
					event.preventDefault();
					commands.find(command => command.id === 'paragraph')?.run();
					return true;
				}
				if (isModifiedShortcut(event, '1', { alt: true })) {
					event.preventDefault();
					commands.find(command => command.id === 'heading')?.run();
					return true;
				}
				if (isModifiedShortcut(event, '8', { shift: true })) {
					event.preventDefault();
					commands.find(command => command.id === 'bullets')?.run();
					return true;
				}
				if (isModifiedShortcut(event, 'c', { alt: true })) {
					event.preventDefault();
					commands.find(command => command.id === 'code')?.run();
					return true;
				}
				if (isModifiedShortcut(event, '-', { alt: true })) {
					event.preventDefault();
					commands.find(command => command.id === 'divider')?.run();
					return true;
				}
				return false;
			},
		},
	});

	useEffect(
		function syncEditorRefFx() {
			editorRef.current = editor;
		},
		[editor]
	);

	useEffect(
		function focusSlashMenuFx() {
			if (!commandMenuState.slashOpen) return;
			const frame = window.requestAnimationFrame(() => {
				commandMenuState.menuRef.current?.focus();
			});
			return () => window.cancelAnimationFrame(frame);
		},
		[commandMenuState]
	);

	useEffect(
		function bindMenuKeyboardFx() {
			const menu = commandMenuState.menuRef.current;
			if (!commandMenuState.slashOpen || !menu || !editor) return;

			const handleMenuKeyDown = (event: KeyboardEvent) => {
				const commands = getEditorCommands(editor, translation.t);
				const stopEditorEvent = () => {
					event.preventDefault();
					event.stopPropagation();
					event.stopImmediatePropagation();
				};

				if (event.key === 'ArrowDown') {
					stopEditorEvent();
					const nextIndex = (commandMenuState.activeCommandIndexRef.current + 1) % commands.length;
					commandMenuState.activeCommandIndexRef.current = nextIndex;
					commandMenuState.setActiveCommandIndex(nextIndex);
					return;
				}
				if (event.key === 'ArrowUp') {
					stopEditorEvent();
					const nextIndex = (commandMenuState.activeCommandIndexRef.current - 1 + commands.length) % commands.length;
					commandMenuState.activeCommandIndexRef.current = nextIndex;
					commandMenuState.setActiveCommandIndex(nextIndex);
					return;
				}
				if (event.key === 'Home') {
					stopEditorEvent();
					commandMenuState.activeCommandIndexRef.current = 0;
					commandMenuState.setActiveCommandIndex(0);
					return;
				}
				if (event.key === 'End') {
					stopEditorEvent();
					commandMenuState.activeCommandIndexRef.current = commands.length - 1;
					commandMenuState.setActiveCommandIndex(commands.length - 1);
					return;
				}
				if (event.key === 'Enter') {
					stopEditorEvent();
					const activeDomIndex = Number(
						commandMenuState.menuRef.current
							?.querySelector('button[aria-current="true"]')
							?.getAttribute('data-command-index') ?? commandMenuState.activeCommandIndexRef.current
					);
					deleteActiveSlashTrigger(editor);
					commands[activeDomIndex]?.run();
					commandMenuState.slashOpenRef.current = false;
					commandMenuState.setSlashOpen(false);
					return;
				}
				if (/^[1-9]$/.test(event.key)) {
					const command = commands[Number(event.key) - 1];
					if (!command) return;
					stopEditorEvent();
					deleteActiveSlashTrigger(editor);
					command.run();
					commandMenuState.slashOpenRef.current = false;
					commandMenuState.setSlashOpen(false);
				}
			};

			menu.addEventListener('keydown', handleMenuKeyDown);
			return () => menu.removeEventListener('keydown', handleMenuKeyDown);
		},
		[commandMenuState, editor, translation.t]
	);

	useEffect(
		function bindDocumentKeyboardFx() {
			if (!editor) return;

			const handleDocumentKeyDown = (event: KeyboardEvent) => {
				const commands = getEditorCommands(editor, translation.t);
				const menuOpen =
					commandMenuState.slashOpenRef.current ||
					Boolean(commandMenuState.menuRef.current) ||
					hasActiveSlashTrigger(editor);
				if (!editor.isFocused && !menuOpen) return;
				const stopEditorEvent = () => {
					event.preventDefault();
					event.stopPropagation();
					event.stopImmediatePropagation();
				};

				if (menuOpen) {
					if (event.key === 'ArrowDown') {
						stopEditorEvent();
						const nextIndex = (commandMenuState.activeCommandIndexRef.current + 1) % commands.length;
						commandMenuState.activeCommandIndexRef.current = nextIndex;
						commandMenuState.setActiveCommandIndex(nextIndex);
						return;
					}
					if (event.key === 'ArrowUp') {
						stopEditorEvent();
						const nextIndex = (commandMenuState.activeCommandIndexRef.current - 1 + commands.length) % commands.length;
						commandMenuState.activeCommandIndexRef.current = nextIndex;
						commandMenuState.setActiveCommandIndex(nextIndex);
						return;
					}
					if (event.key === 'Home') {
						stopEditorEvent();
						commandMenuState.activeCommandIndexRef.current = 0;
						commandMenuState.setActiveCommandIndex(0);
						return;
					}
					if (event.key === 'End') {
						stopEditorEvent();
						commandMenuState.activeCommandIndexRef.current = commands.length - 1;
						commandMenuState.setActiveCommandIndex(commands.length - 1);
						return;
					}
					if (event.key === 'Enter') {
						stopEditorEvent();
						const activeDomIndex = Number(
							commandMenuState.menuRef.current
								?.querySelector('button[aria-current="true"]')
								?.getAttribute('data-command-index') ?? commandMenuState.activeCommandIndexRef.current
						);
						deleteActiveSlashTrigger(editor);
						commands[activeDomIndex]?.run();
						commandMenuState.slashOpenRef.current = false;
						commandMenuState.setSlashOpen(false);
						return;
					}
					if (/^[1-9]$/.test(event.key)) {
						const command = commands[Number(event.key) - 1];
						if (command) {
							stopEditorEvent();
							deleteActiveSlashTrigger(editor);
							command.run();
							commandMenuState.slashOpenRef.current = false;
							commandMenuState.setSlashOpen(false);
						}
					}
				}
			};

			window.addEventListener('keydown', handleDocumentKeyDown, { capture: true });
			return () => {
				window.removeEventListener('keydown', handleDocumentKeyDown, { capture: true });
			};
		},
		[commandMenuState, editor, translation.t]
	);

	useEffect(
		function syncExternalContentFx() {
			if (!editor) return;
			const current = editor.getJSON();
			if (!isSameEditorContent(current, props.content)) {
				editor.commands.setContent(props.content, { emitUpdate: false });
			}
		},
		[editor, props.content]
	);

	useEffect(
		function unlockDragHandleOnPointerEndFx() {
			if (!dragHandleState.dragHandleLocked) return;
			window.addEventListener('pointerup', dragHandleState.unlockDragHandle);
			window.addEventListener('pointercancel', dragHandleState.unlockDragHandle);
			return () => {
				window.removeEventListener('pointerup', dragHandleState.unlockDragHandle);
				window.removeEventListener('pointercancel', dragHandleState.unlockDragHandle);
			};
		},
		[dragHandleState]
	);

	useEffect(
		function flushOnUnmountFx() {
			return () => {
				props.onFlush();
			};
		},
		[props.onFlush]
	);

	const runSlashCommand = useCallback(
		(run: () => boolean) => {
			if (!editor) return;
			deleteActiveSlashTrigger(editor);
			run();
			commandMenuState.closeSlashMenu();
		},
		[commandMenuState, editor]
	);

	const handleBlockDragStart = useCallback(() => {
		commandMenuState.closeSlashMenu();
		dragHandleState.lockDragHandle();
	}, [commandMenuState, dragHandleState]);

	const handleEditorFrameKeyDown = useCallback(
		(event: ReactKeyboardEvent<HTMLDivElement>) => {
			if (!editor) return;
			const menuOpen = commandMenuState.slashOpenRef.current || hasActiveSlashTrigger(editor);
			if (!menuOpen) return;

			const commands = getEditorCommands(editor, translation.t);
			const stopEditorEvent = () => {
				event.preventDefault();
				event.stopPropagation();
				event.nativeEvent.stopImmediatePropagation();
			};

			if (event.key === 'ArrowDown') {
				stopEditorEvent();
				const nextIndex = (commandMenuState.activeCommandIndexRef.current + 1) % commands.length;
				commandMenuState.activeCommandIndexRef.current = nextIndex;
				commandMenuState.setActiveCommandIndex(nextIndex);
				return;
			}
			if (event.key === 'ArrowUp') {
				stopEditorEvent();
				const nextIndex = (commandMenuState.activeCommandIndexRef.current - 1 + commands.length) % commands.length;
				commandMenuState.activeCommandIndexRef.current = nextIndex;
				commandMenuState.setActiveCommandIndex(nextIndex);
				return;
			}
			if (event.key === 'Home') {
				stopEditorEvent();
				commandMenuState.activeCommandIndexRef.current = 0;
				commandMenuState.setActiveCommandIndex(0);
				return;
			}
			if (event.key === 'End') {
				stopEditorEvent();
				commandMenuState.activeCommandIndexRef.current = commands.length - 1;
				commandMenuState.setActiveCommandIndex(commands.length - 1);
				return;
			}
			if (event.key === 'Enter') {
				stopEditorEvent();
				const activeDomIndex = Number(
					commandMenuState.menuRef.current
						?.querySelector('button[aria-current="true"]')
						?.getAttribute('data-command-index') ?? commandMenuState.activeCommandIndexRef.current
				);
				deleteActiveSlashTrigger(editor);
				commands[activeDomIndex]?.run();
				commandMenuState.slashOpenRef.current = false;
				commandMenuState.setSlashOpen(false);
				return;
			}
			if (/^[1-9]$/.test(event.key)) {
				const command = commands[Number(event.key) - 1];
				if (!command) return;
				stopEditorEvent();
				deleteActiveSlashTrigger(editor);
				command.run();
				commandMenuState.slashOpenRef.current = false;
				commandMenuState.setSlashOpen(false);
			}
		},
		[commandMenuState, editor, translation.t]
	);

	if (!editor) return <div className='editor-loading'>{translation.t('editor.loading')}</div>;

	const commands = getEditorCommands(editor, translation.t);
	const selectionCommands = commands.filter(command => command.selectionMenu);

	return (
		<div className='editor-surface'>
			<div
				className={`editor-frame${dragHandleState.dragHandleLocked ? ' is-block-dragging' : ''}`}
				onKeyDownCapture={handleEditorFrameKeyDown}
			>
				<DragHandle
					editor={editor}
					className={`block-drag-handle${dragHandleState.dragHandleVisible ? '' : ' is-hidden'}`}
					onElementDragStart={handleBlockDragStart}
					onElementDragEnd={dragHandleState.unlockDragHandle}
					onNodeChange={params => {
						dragHandleState.setDragHandleVisible(isVisibleDragHandleNode(params.node));
						if (!params.node) dragHandleState.unlockDragHandle();
					}}
				>
					<div
						role='button'
						tabIndex={0}
						aria-label={translation.t('editor.dragHandle')}
						aria-hidden={!dragHandleState.dragHandleVisible}
						title={translation.t('editor.dragHandle')}
						onMouseDown={event => {
							event.stopPropagation();
							handleBlockDragStart();
						}}
						onPointerDown={event => {
							event.stopPropagation();
							handleBlockDragStart();
						}}
						onPointerUp={dragHandleState.unlockDragHandle}
						onPointerCancel={dragHandleState.unlockDragHandle}
					>
						<GripVertical className='size-4' />
					</div>
				</DragHandle>
				<EditorContent editor={editor} />
				<BubbleMenu
					editor={editor}
					shouldShow={params =>
						params.editor.isEditable &&
						!params.editor.state.selection.empty &&
						!commandMenuState.slashOpenRef.current &&
						!dragHandleState.dragHandleLockedRef.current
					}
				>
					<SelectionMenu commands={selectionCommands} editor={editor} t={translation.t} />
				</BubbleMenu>
				{commandMenuState.slashOpen ? (
					<SlashCommandMenu
						activeCommandIndex={commandMenuState.activeCommandIndex}
						commands={commands}
						menuRef={commandMenuState.menuRef}
						onCommandIndexChange={commandMenuState.changeActiveCommandIndex}
						onFrameKeyDown={handleEditorFrameKeyDown}
						onRunCommand={runSlashCommand}
						t={translation.t}
					/>
				) : null}
			</div>
		</div>
	);
};
