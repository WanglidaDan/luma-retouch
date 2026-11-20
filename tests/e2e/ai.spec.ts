import { expect, test } from '@playwright/test';
import { makeImageFile, openSample, storeState } from './helpers';

test.describe('AI tools (cloud calls mocked)', () => {
  test('missing key shows guidance; saved key enables Generate; mocked Gemini result replaces the image and can be undone', async ({
    page,
  }) => {
    await openSample(page);
    await page.getByTestId('tool-ai').click();
    await expect(page.getByText('Cloud AI tools need your own API key')).toBeVisible();
    await page.getByTestId('ai-task-ai-colorize').click();
    await expect(page.getByTestId('ai-run')).toBeDisabled();
    // Save a key through Settings.
    await page.getByTestId('ai-keys').click();
    await page.getByTestId('key-gemini').fill('AIzaSyTESTKEY1234567890abcdefghijk');
    await page.getByTestId('save-key-gemini').click();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByTestId('ai-task-ai-colorize').click(); // deselect
    await page.getByTestId('ai-task-ai-colorize').click();
    await expect(page.getByTestId('ai-run')).toBeEnabled();
    // Mock Gemini: return a 640x480 blue PNG.
    const fake = await makeImageFile(page, 'ai.png', 640, 480, '#2244ff');
    let requestBody: Record<string, unknown> | null = null;
    await page.route('https://generativelanguage.googleapis.com/**', async (route) => {
      requestBody = route.request().postDataJSON() as Record<string, unknown>;
      expect(route.request().headers()['x-goog-api-key']).toContain('AIzaSyTESTKEY');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  { inlineData: { mimeType: 'image/png', data: fake.buffer.toString('base64') } },
                ],
              },
            },
          ],
        }),
      });
    });
    const widthBefore = await storeState<number>(page, 'snapshot.source.full.width');
    await page.getByTestId('ai-run').click();
    await expect(page.getByText(/Colorize done/)).toBeVisible({ timeout: 15000 });
    expect(requestBody).not.toBeNull();
    const parts = (requestBody as unknown as { contents: { parts: Record<string, unknown>[] }[] })
      .contents[0]!.parts;
    expect((parts[0] as { text: string }).text).toContain('Colorize');
    expect(parts[1]).toHaveProperty('inline_data');
    expect(await storeState<number>(page, 'snapshot.source.full.width')).toBe(640);
    expect(await storeState<number>(page, 'snapshot.source.full.height')).toBe(480);
    await page.getByTestId('undo').click();
    await page.waitForTimeout(200);
    expect(await storeState<number>(page, 'snapshot.source.full.width')).toBe(widthBefore);
  });

  test('API errors are shown as friendly messages; masked task routes to OpenAI when its key exists', async ({
    page,
  }) => {
    await openSample(page);
    await page.evaluate(() => localStorage.clear());
    await page.getByTestId('tool-ai').click();
    await page.getByTestId('ai-keys').click();
    await page.getByTestId('key-gemini').fill('AIzaSyTESTKEY1234567890abcdefghijk');
    await page.getByTestId('save-key-gemini').click();
    await page.getByTestId('key-openai').fill('sk-test-1234567890abcdefghijklmnop');
    await page.getByTestId('save-key-openai').click();
    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByRole('button', { name: 'Remove & Replace' }).click();
    await page.getByTestId('ai-task-ai-remove').click();
    // Seed a deterministic painted mask through the e2e store hook. Mobile browser mouse
    // emulation does not consistently deliver pointer capture to the canvas.
    await page.evaluate(() => {
      const hook = (
        window as unknown as {
          __pb: {
            interaction: {
              getState: () => { set: (patch: Record<string, unknown>) => void };
            };
          };
        }
      ).__pb;
      const mask = document.createElement('canvas');
      mask.width = 32;
      mask.height = 32;
      const context = mask.getContext('2d')!;
      context.fillStyle = '#ff2d7a';
      context.fillRect(8, 8, 16, 16);
      hook.interaction.getState().set({ aiMask: mask, aiMaskVersion: 1 });
    });
    await expect(page.getByText(/Runs on OpenAI/)).toBeVisible();
    let sawMask = false;
    await page.route('https://api.openai.com/**', async (route) => {
      const headers = route.request().headers();
      expect(headers.authorization).toBe('Bearer sk-test-1234567890abcdefghijklmnop');
      sawMask = (route.request().postData() ?? '').includes('name="mask"');
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: { message: 'Rate limit' } }),
      });
    });
    await page.getByTestId('ai-prompt').fill('the tree');
    await page.getByTestId('ai-run').click();
    await expect(page.getByRole('alert')).toContainText(/rate limit or quota/i, { timeout: 15000 });
    expect(sawMask).toBe(true);
  });
});
