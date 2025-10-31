import { test, expect } from '@playwright/test';

test('home carga y responde OK', async ({ page }) => {
  const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
  expect(response, 'La navegación inicial debe devolver una respuesta').toBeTruthy();
  expect(response!.ok(), 'Respuesta HTTP no es OK').toBeTruthy();

  // Verifica que el body exista y tenga contenido renderizado
  await expect(page.locator('body')).toBeVisible();
  const html = await page.content();
  expect(html.length).toBeGreaterThan(50); // página no vacía
});
