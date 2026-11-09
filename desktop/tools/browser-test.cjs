// SPDX-License-Identifier: GPL-3.0-only
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const { build } = require('esbuild');
const root = path.resolve(__dirname, '..');
(async () => {
  const resultDir = path.join(root, 'test-results'); fs.mkdirSync(resultDir, { recursive: true });
  const bundled = await build({ entryPoints: [path.join(root, 'test/browser-entry.js')], bundle: true, write: false, format: 'iife', define: { 'process.env.NODE_ENV': '"development"' } });
  const resources = {
    '/': ['text/html', '<!doctype html><html lang="de"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Myspoti Test-Harness – künstlicher Host</title><link rel="stylesheet" href="/style.css"><body style="margin:0;background:#121212"><p style="color:#fff;background:#682c00;margin:0;padding:8px;font:14px system-ui">TEST-HARNESS · künstlicher Player · kein Spotify-Laufzeitnachweis</p><div id="root"></div><script src="/host.js"></script><script src="/app.js"></script><script src="/background.js"></script><script>mountTestApp()</script></body></html>'],
    '/host.js': ['text/javascript', bundled.outputFiles[0].text],
    '/app.js': ['text/javascript', fs.readFileSync(path.join(root, 'dist/myspoti-desktop/index.js'))],
    '/background.js': ['text/javascript', fs.readFileSync(path.join(root, 'src/background.js'))],
    '/style.css': ['text/css', fs.readFileSync(path.join(root, 'src/style.css'))]
  };
  const server = http.createServer((req, res) => { const item = resources[req.url]; res.writeHead(item ? 200 : 404, { 'Content-Type': item?.[0] || 'text/plain' }); res.end(item?.[1] || 'Not found'); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    const executablePath = process.env.MYSPOTI_TEST_BROWSER;
    if (!executablePath) throw Error('Set MYSPOTI_TEST_BROWSER to a Chromium-family browser executable.');
    browser = await chromium.launch({ executablePath, headless: true });
    const page = await browser.newPage(); const failures = []; page.on('pageerror', e => failures.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    await page.getByRole('heading', { name: 'Myspoti Desktop', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Abspielen', exact: true }).click(); await page.getByRole('button', { name: 'Pause', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    await page.getByRole('searchbox').fill('A & B'); await page.getByRole('button', { name: 'Suchen', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.testCalls.slice(0, 3)), [['play'], ['pause'], ['navigate', '/search/A%20%26%20B']]);
    await page.locator('input[type=file]').setInputFiles({ name: 'test.lrc', mimeType: 'text/plain', buffer: Buffer.from('[00:00]Erste Zeile\n[00:12]Zweite Zeile\n[00:30]Dritte Zeile') });
    await page.getByRole('button', { name: 'Dritte Zeile', exact: true }).click();
    assert.ok(await page.evaluate(() => window.testCalls.some(x => x[0] === 'seek' && x[1] === 30000)));
    await page.getByRole('button', { name: '15 Min.', exact: true }).click();
    assert.ok(await page.evaluate(() => MyspotiDesktopRuntime.timer.deadline > Date.now()));
    await page.getByRole('button', { name: 'Abbrechen', exact: true }).click();
    const layouts = [];
    for (const [width, height] of [[1280,720],[1440,900],[1920,1080]]) {
      await page.setViewportSize({ width, height });
      for (const mode of ['classic', 'immersive']) {
        const current = await page.locator('main').getAttribute('class');
        if (!current.includes(mode)) await page.getByRole('button', { name: mode === 'classic' ? 'Classic' : 'Immersive', exact: true }).click();
        await page.locator('.msp-cover').evaluate(async element => { await Promise.all(element.getAnimations().map(animation => animation.finished)); });
        await page.screenshot({ path: path.join(resultDir, `${mode}-${width}x${height}.png`), fullPage: true });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
        assert.equal(overflow, false, `${mode} ${width}: horizontal overflow`); layouts.push({ mode, width, height, horizontalOverflow: overflow });
      }
    }
    await page.getByRole('button', { name: 'Einstellungen', exact: true }).click();
    await page.getByLabel('AMOLED-Schwarz').check(); await page.getByLabel('Animationen reduzieren').check();
    await page.reload(); await page.getByRole('heading', { name: 'Myspoti Desktop', exact: true }).waitFor();
    assert.match(await page.locator('main').getAttribute('class'), /immersive amoled reduce-motion/);
    await page.evaluate(() => { Spicetify.Player.data.restrictions.canSkipNext = false; });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Weiter' && b.disabled));
    await page.evaluate(() => { Spicetify.Player.pause = () => { throw Error('private-access-token'); }; Spicetify.Player.play(); });
    await page.getByRole('button', { name: 'Pause', exact: true }).click();
    assert.ok(!(await page.locator('body').innerText()).includes('private-access-token'));
    await page.getByRole('alert').waitFor(); assert.deepEqual(failures, []);
    fs.writeFileSync(path.join(resultDir, 'browser-report.json'), JSON.stringify({ harness: 'Artificial Spicetify host, not live Spotify', layouts, pageErrors: failures, interactions: ['play/pause','search encoding','LRC import/seek','timer start/cancel','mode change','settings restoration','restrictions','redacted failure'] }, null, 2));
    console.log('Browser-Harness: 6 Layouts und 8 Interaktionsgruppen bestanden; kein Live-Spotify-Nachweis.');
  } finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
