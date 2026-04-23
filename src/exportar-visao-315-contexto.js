const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const EMAIL = process.env.HANDIT_EMAIL;
const PASSWORD = process.env.HANDIT_PASSWORD;
const BASE_URL = 'https://modelo-homolog.handit.com.br';
const DOWNLOAD_DIR = path.join(__dirname, '..', 'downloads');
const EXPORT_OPTION_TEXT = 'Exportar para tabela dinâmica com contexto';

const VIEWS = [
  '2.0.2 - Receitas - Manutenção - Contabilização do Resultado',
  'Receitas - Orçamento - Cálculo de Margem',
];

if (!EMAIL || !PASSWORD) {
  console.error('Defina HANDIT_EMAIL e HANDIT_PASSWORD antes de executar o script.');
  process.exit(1);
}

async function login(page) {
  await page.goto(`${BASE_URL}/#/login/challenge/pwd`, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await page.locator('#username').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('**/#/home', { timeout: 60000 });
  await page.waitForTimeout(4000);
}

async function openView(page, viewName) {
  await page.getByText('Pesquisar (Ctrl + K)', { exact: true }).click();

  const searchInput = page.locator('#search-input');
  await searchInput.fill('');
  await searchInput.fill(viewName);
  await page.waitForTimeout(2500);

  await page
    .locator('li.itensList')
    .filter({ hasText: viewName })
    .first()
    .click();

  await page.waitForURL('**/#/spreadsheets/view/*', { timeout: 60000 });
  await page.waitForTimeout(6000);

  const currentUrl = page.url();
  const match = currentUrl.match(/\/spreadsheets\/view\/(\d+)/);
  const viewId = match ? match[1] : 'desconhecido';

  return {
    viewId,
    currentUrl,
  };
}

async function exportPivotWithContext(page) {
  fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

  await page.locator('#configDropDown').click();
  await page.waitForTimeout(1000);

  const option = page
    .locator('a')
    .filter({ hasText: EXPORT_OPTION_TEXT })
    .first();

  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 120000 }),
    option.click(),
  ]);

  const suggested = download.suggestedFilename();
  const target = path.join(DOWNLOAD_DIR, suggested);
  await download.saveAs(target);

  return target;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  try {
    await login(page);

    for (const viewName of VIEWS) {
      const { viewId, currentUrl } = await openView(page, viewName);
      const exportedFile = await exportPivotWithContext(page);

      console.log(`Visao: ${viewName}`);
      console.log(`ID: ${viewId}`);
      console.log(`URL: ${currentUrl}`);
      console.log(`Arquivo exportado: ${exportedFile}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
