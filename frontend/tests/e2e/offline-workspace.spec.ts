import { expect, type Page, test } from '@playwright/test';

const editor = '.ProseMirror';
const titleInput = '.document-title-block input';

async function openWorkspace(page: Page) {
	await page.goto('/');
	await page.evaluate(async () => {
		await Promise.all(
			(await navigator.serviceWorker.getRegistrations()).map(registration => registration.unregister())
		);
		await Promise.all((await caches.keys()).map(cacheName => caches.delete(cacheName)));
	});
	await page.reload();
	await expect(page.getByLabel(/Название рабочей области|Workspace name/).first()).toBeVisible();
	await expect(page.locator('.editor-frame')).toBeVisible();
}

test('anonymous workspace renders on desktop and mobile', async ({ page }) => {
	await openWorkspace(page);

	await page.setViewportSize({ width: 390, height: 844 });
	await page.getByRole('button', { name: /Открыть документы|Open documents/ }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.getByText(/Документы|Documents/)).toBeVisible();
});

test('slash command removes the trigger and can be used repeatedly', async ({ page }) => {
	await openWorkspace(page);

	await expect(page.locator('.editor-toolbar')).toHaveCount(0);

	await page.locator(editor).click();
	await page.locator(editor).press('Control+A');
	await page.keyboard.type('/');
	await expect(page.locator('.slash-menu')).toBeVisible();

	await page
		.locator('.slash-menu button')
		.filter({ hasText: /Заголовок|Heading/ })
		.click();
	await expect(page.locator('.slash-menu')).toBeHidden();
	await page.keyboard.type('Slash heading');
	await expect(page.locator(`${editor} h2`)).toContainText('Slash heading');
	await expect(page.locator(editor)).not.toContainText('/Slash heading');

	await page.keyboard.press('Enter');
	await page.keyboard.type('/');
	await expect(page.locator('.slash-menu')).toBeVisible();
	await page
		.locator('.slash-menu button')
		.filter({ hasText: /Текст|Text/ })
		.click();
	await expect(page.locator('.slash-menu')).toBeHidden();
	await page.keyboard.type('Plain paragraph');
	await expect(page.locator(editor)).toContainText('Plain paragraph');
	await expect(page.locator(editor)).not.toContainText('/Plain paragraph');
});

test('slash commands support keyboard navigation, shortcuts, and dividers', async ({ page }) => {
	await openWorkspace(page);

	await page.locator(editor).click();
	await page.locator(editor).press('Control+A');
	await page.keyboard.type('/');
	const slashMenu = page.locator('.slash-menu');
	await expect(slashMenu).toBeVisible();
	await expect(slashMenu).toBeFocused();
	await page.keyboard.press('ArrowDown');
	await expect(page.locator('.slash-menu button').filter({ hasText: /Заголовок|Heading/ })).toHaveAttribute(
		'aria-current',
		'true'
	);
	await page.keyboard.press('Enter');
	await page.keyboard.type('Keyboard heading');
	await expect(page.locator(`${editor} h2`)).toContainText('Keyboard heading');
	await expect(page.locator(editor)).not.toContainText('/Keyboard heading');

	await page.keyboard.press('Enter');
	await page.keyboard.press('Control+/');
	await expect(page.locator('.slash-menu')).toBeVisible();
	await page.keyboard.press('5');
	await expect(page.locator('.slash-menu')).toBeHidden();
	await expect(page.locator(`${editor} hr`)).toHaveCount(1);

	await page.keyboard.press('Control+Alt+1');
	await page.keyboard.type('Shortcut heading');
	await expect(page.locator(`${editor} h2`).last()).toContainText('Shortcut heading');

	await page.keyboard.press('Enter');
	await page.keyboard.press('Control+Alt+0');
	await page.keyboard.press('Control+B');
	await page.keyboard.type('Bold from shortcut');
	await expect(page.locator(`${editor} strong`)).toContainText('Bold from shortcut');
});

test('selection toolbar applies commands to highlighted text', async ({ page }) => {
	await openWorkspace(page);

	await page.locator(editor).fill('Format this selection');
	await page.locator(editor).press('Control+A');
	const selectionMenu = page.locator('.selection-menu');
	await expect(selectionMenu).toBeVisible();
	await selectionMenu.getByRole('button', { name: /Жирный|Bold/ }).click();
	await expect(page.locator(`${editor} strong`)).toContainText('Format this selection');

	await page.locator(`${editor} strong`).dblclick();
	await expect(selectionMenu).toBeVisible();
	await selectionMenu.getByRole('button', { name: /Курсив|Italic/ }).click();
	await expect(page.locator(`${editor} em`)).toContainText('this');
});

test('block drag handle is stable and does not leave editor artifacts', async ({ page }) => {
	await openWorkspace(page);

	await page.locator(editor).fill('First block\n\nThird block');
	const firstBlock = page.locator(`${editor} p`).filter({ hasText: 'First block' });
	const emptyBlock = page.locator(`${editor} p`).nth(1);
	const thirdBlock = page.locator(`${editor} p`).filter({ hasText: 'Third block' });
	await expect(firstBlock).toBeVisible();
	await expect(emptyBlock).toBeVisible();
	await expect(thirdBlock).toBeVisible();

	await emptyBlock.hover();
	await expect(page.locator('.block-drag-handle')).toBeHidden();

	await firstBlock.hover();
	const handle = page.locator('.block-drag-handle');
	await expect(handle).toBeVisible();
	await expect(handle.getByTitle('Drag to move')).toBeVisible();
	await expect(handle).toHaveAttribute('draggable', 'true');

	const box = await handle.boundingBox();
	expect(box).not.toBeNull();
	await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
	await page.mouse.down();
	await expect(page.locator('.selection-menu')).toBeHidden();
	await expect(page.locator('.slash-menu')).toBeHidden();
	await page.mouse.up();

	await handle.dragTo(thirdBlock);
	await expect(page.locator(editor)).toContainText('First block');
	await expect(page.locator(editor)).toContainText('Third block');
	await expect(page.locator(`${editor} hr`)).toHaveCount(0);
	await expect(page.locator('.editor-dropcursor')).toBeHidden();
});

test('autosaves editor content when switching pages', async ({ page }) => {
	await openWorkspace(page);

	await page.locator(editor).fill('Autosave survives page switching');
	await expect(page.locator(editor)).toContainText('Autosave survives page switching');

	await page.getByRole('button', { name: /API Contract/ }).click();
	await expect(page.locator(titleInput)).toHaveValue('API Contract');
	await page.getByRole('button', { name: /System Overview/ }).click();
	await expect(page.locator(editor)).toContainText('Autosave survives page switching');
	await expect(page.locator('.save-status')).toContainText(/Сохранено|Saved/);
});

test('creates, renames, and deletes local pages from the document tree', async ({ page }) => {
	await openWorkspace(page);

	await page
		.getByRole('complementary')
		.getByRole('button', { name: /Страница|New page/ })
		.click();
	await expect(page.locator('.workspace-breadcrumb')).toContainText(/Без названия|Untitled/);
	await page.locator(titleInput).click();
	await page.locator(titleInput).fill('E2E scratch page');
	await expect(page.locator(titleInput)).toHaveValue('E2E scratch page');
	await page.locator(titleInput).blur();
	await expect(page.getByRole('button', { name: /E2E scratch page/ })).toBeVisible();

	const row = page.locator('.tree-row').filter({ hasText: 'E2E scratch page' });
	await row.hover();
	page.on('dialog', dialog => dialog.accept());
	await row.getByRole('button', { name: /Удалить|Delete/ }).click();

	await expect(page.getByRole('button', { name: /E2E scratch page/ })).toBeHidden();
	await expect(page.locator(titleInput)).not.toHaveValue('E2E scratch page');
});

test('renames workspace, filters tree, and creates nested folders', async ({ page }) => {
	await openWorkspace(page);

	const workspaceName = page.getByLabel(/Название рабочей области|Workspace name/).first();
	await workspaceName.fill('Research lab');
	await workspaceName.blur();
	await expect(workspaceName).toHaveValue('Research lab');

	const search = page.getByLabel(/Поиск|Search/).first();
	await search.fill('API');
	await expect(page.getByRole('button', { name: /API Contract/ })).toBeVisible();
	await expect(page.getByRole('button', { name: /Data Model/ })).toBeHidden();
	await search.fill('');

	const architectureRow = page.locator('.tree-row').filter({ hasText: 'Architecture' }).first();
	await architectureRow.hover();
	await architectureRow.getByRole('button', { name: /Добавить подпапку|Add subfolder/ }).click();
	const nestedFolder = page
		.locator('.tree-row')
		.filter({ hasText: /Новая папка|Untitled folder/ })
		.first();
	await expect(nestedFolder).toBeVisible();

	await nestedFolder.hover();
	await nestedFolder.getByRole('button', { name: /Добавить страницу|Add page/ }).click();
	await expect(page.locator('.document-title-block p')).toContainText(
		/Architecture \/ Новая папка|Architecture \/ Untitled folder/
	);
	await expect(page.locator('.document-title-block p')).not.toHaveText(/Архитектура$/);
});

test('opens storage details and switches language and theme', async ({ page }) => {
	await openWorkspace(page);

	await page.getByRole('button', { name: /Локальное хранилище|Local storage/ }).click();
	await expect(page.getByRole('dialog')).toBeVisible();
	await expect(page.getByText(/Использование хранилища|Storage usage/)).toBeVisible();
	await page.locator('.modal-head button').click();
	await expect(page.getByRole('dialog')).toBeHidden();

	await page.getByRole('button', { name: 'EN', exact: true }).click();
	await expect(page.getByRole('button', { name: 'New page' })).toBeVisible();
	await page.getByRole('button', { name: 'Dark' }).click();
	await expect(page.locator('html')).toHaveClass(/dark/);
});
