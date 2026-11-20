import { expect, test } from '@playwright/test';
import {
  makeImageFile,
  openSample,
  previewStats,
  regionLuminance,
  trackConsoleErrors,
} from './helpers';

test.describe('smoke and layout', () => {
  test('home loads, sample opens, layout fits the viewport', async ({ page }, testInfo) => {
    const errors = trackConsoleErrors(page);
    await page.goto('/?e2e');
    await expect(page.getByTestId('home')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Your portrait retouch');
    await page.getByTestId('open-sample').click();
    await expect(page.getByTestId('editor')).toBeVisible();
    await expect(page.getByTestId('tool-rail')).toBeVisible();
    await expect(page.getByTestId('tool-adjust')).toBeVisible();
    const stats = await previewStats(page);
    expect(stats.width).toBeGreaterThan(100);
    expect(stats.mean).toBeGreaterThan(20);
    // Orientation: the sample's sky (top left) must be brighter than the dark bag at the bottom left.
    const sky = await regionLuminance(page, 'preview-canvas', 0.2, 0.1);
    const bag = await regionLuminance(page, 'preview-canvas', 0.18, 0.88);
    expect(sky).toBeGreaterThan(bag + 40);
    // No horizontal page overflow on any viewport.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    // Open a panel on each viewport and check it stays inside the screen.
    await page.getByTestId('tool-adjust').click();
    const panel = page.getByTestId('panel-adjust');
    await expect(panel).toBeVisible();
    const box = (await panel.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    await page.screenshot({ path: testInfo.outputPath('editor.png') });
    expect(errors).toEqual([]);
  });

  test('every tool panel opens without errors', async ({ page }) => {
    const errors = trackConsoleErrors(page);
    await openSample(page);
    for (const tool of [
      'adjust',
      'filters',
      'crop',
      'beauty',
      'ai',
      'effects',
      'text',
      'stickers',
      'frames',
      'doodle',
      'mosaic',
      'watermark',
      'layers',
    ]) {
      await page.getByTestId(`tool-${tool}`).click();
      await expect(page.getByTestId(`panel-${tool}`)).toBeVisible();
      if (tool === 'crop') await page.getByTestId('crop-cancel').click();
    }
    expect(errors.filter((e) => !/face|mediapipe|wasm/i.test(e))).toEqual([]);
  });

  test('native import control stays available from the editor', async ({ page }) => {
    await openSample(page);
    await page
      .getByTestId('native-open-file-input')
      .setInputFiles([await makeImageFile(page, 'replacement.png', 640, 480, '#4488cc')]);
    await expect(page.getByTestId('editor')).toBeVisible();
    const width = await page.evaluate(() => {
      const store = (
        window as unknown as {
          __pb: {
            store: { getState: () => { snapshot: { source: { full: { width: number } } } } };
          };
        }
      ).__pb.store.getState();
      return store.snapshot.source.full.width;
    });
    expect(width).toBe(640);
  });

  test('Chinese locale translates the Mac portrait workflow', async ({ page }) => {
    await page.goto('/?e2e&locale=zh-CN');
    await expect(page.getByTestId('home')).toContainText('导入并自动修图');
    await expect(page.getByTestId('home')).toContainText('导入照片，即刻开始人像精修。');
    await page.getByTestId('open-batch').click();
    await expect(page.getByRole('heading', { name: '批量修图' })).toBeVisible();
    await expect(page.getByLabel('使用本机 AI 磨皮与瘦脸')).toBeChecked();
    await page
      .getByTestId('batch-files')
      .setInputFiles([
        await makeImageFile(page, 'one.png', 320, 240, '#e88a71'),
        await makeImageFile(page, 'two.png', 320, 240, '#6688bb'),
      ]);
    await expect(page.getByTestId('batch-run')).toHaveText('开始处理 2 张照片');
  });
});
