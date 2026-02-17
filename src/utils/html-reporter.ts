import fs from 'node:fs'
import path from 'node:path'
import type { Reporter, RunnerStats, TestStats } from '@wdio/reporter'
import WDIOReporter from '@wdio/reporter'

type TestEntry = {
  uid: string
  title: string
  fullTitle: string
  start: Date
  end?: Date
  durationMs?: number
  state?: 'passed' | 'failed' | 'skipped'
  error?: string
  screenshot?: string
  platform?: string
}

export default class HtmlReporter extends WDIOReporter implements Reporter {
  private runnerStart?: Date
  private runnerEnd?: Date
  private capabilities?: Record<string, unknown>
  private tests: Map<string, TestEntry> = new Map()
  private outputPath: string

  constructor(options: { outputDir?: string; filename?: string } = {}) {
    super(options)
    const outputDir = options.outputDir ?? path.resolve(process.cwd(), 'reports')
    const filename = options.filename ?? 'report.html'
    this.outputPath = path.join(outputDir, filename)
  }

  onRunnerStart(runner: RunnerStats) {
    this.runnerStart = new Date(runner.start)
    const caps = Array.isArray(runner.capabilities) ? runner.capabilities[0] : runner.capabilities
    this.capabilities = caps ?? undefined
  }

  onTestStart(test: TestStats) {
    const entry: TestEntry = {
      uid: test.uid,
      title: test.title,
      fullTitle: this.fullTitle(test),
      start: new Date()
    }
    this.tests.set(test.uid, entry)
    this.writeReport()
  }

  onTestPass(test: TestStats) {
    this.completeTest(test, 'passed')
  }

  onTestFail(test: TestStats) {
    this.completeTest(test, 'failed', test.error)
  }

  onTestSkip(test: TestStats) {
    this.completeTest(test, 'skipped')
  }

  onRunnerEnd(runner: RunnerStats) {
    this.runnerEnd = new Date(runner.end)
    this.writeReport()
  }

  private completeTest(test: TestStats, state: TestEntry['state'], error?: Error) {
    const entry = this.tests.get(test.uid)
    const end = new Date()
    if (entry) {
      entry.end = end
      entry.durationMs = test.duration ?? (end.getTime() - entry.start.getTime())
      entry.state = state
      entry.error = error ? String(error.message ?? error) : undefined
      entry.screenshot = (test as unknown as { screenshot?: string }).screenshot
      entry.platform = String(this.capabilities?.['platformName'] ?? '').toLowerCase()
    }
    this.writeReport()
  }

  private fullTitle(test: TestStats) {
    const parents = test.parent ? [test.parent] : []
    return [...parents, test.title].filter(Boolean).join(' > ')
  }

  private writeReport() {
    const outputDir = path.dirname(this.outputPath)
    fs.mkdirSync(outputDir, { recursive: true })

    const tests = Array.from(this.tests.values())
    const passed = tests.filter(t => t.state === 'passed').length
    const failed = tests.filter(t => t.state === 'failed').length
    const skipped = tests.filter(t => t.state === 'skipped').length
    const total = tests.length

    const runnerStart = this.runnerStart ? this.runnerStart.toISOString() : '-'
    const runnerEnd = this.runnerEnd ? this.runnerEnd.toISOString() : '-'

    const rows = tests.map(t => {
      const start = t.start ? t.start.toISOString() : '-'
      const end = t.end ? t.end.toISOString() : '-'
      const duration = t.durationMs != null ? `${t.durationMs} ms` : '-'
      const state = t.state ?? 'running'
      const error = t.error ?? ''
      const screenshot = t.screenshot
        ? `<a href=\"${this.escape(t.screenshot)}\" target=\"_blank\">View</a>`
        : '-'
      const errorBlock = error
        ? `<details><summary>Details</summary><pre>${this.escape(error)}</pre></details>`
        : ''
      return `
        <tr data-status="${state}" data-platform="${this.escape(t.platform ?? '')}">
          <td>${this.escape(t.fullTitle)}</td>
          <td><span class="badge ${state}">${state}</span></td>
          <td>${start}</td>
          <td>${end}</td>
          <td>${duration}</td>
          <td>${screenshot}</td>
          <td>${errorBlock}</td>
        </tr>
      `
    }).join('')

    const meta = this.capabilities ?? {}
    const deviceName = String(meta['appium:deviceName'] ?? meta['deviceName'] ?? '-')
    const platformName = String(meta['platformName'] ?? '-')
    const platformVersion = String(meta['appium:platformVersion'] ?? meta['platformVersion'] ?? '-')
    const app = String(meta['appium:app'] ?? meta['app'] ?? '-')

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>WDIO Test Report</title>
  <style>
    :root {
      --bg: #0f172a;
      --card: #111827;
      --text: #e5e7eb;
      --muted: #9ca3af;
      --accent: #38bdf8;
      --pass: #22c55e;
      --fail: #ef4444;
      --skip: #f59e0b;
      --table: #0b1220;
    }
    body { font-family: "Segoe UI", system-ui, sans-serif; margin: 0; background: var(--bg); color: var(--text); }
    header { padding: 24px 28px; background: linear-gradient(120deg, #0b1220, #111827); }
    h1 { margin: 0 0 6px; font-size: 22px; }
    .meta { color: var(--muted); font-size: 12px; }
    .container { padding: 20px 28px 32px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 12px 0 18px; }
    .card { background: var(--card); border: 1px solid #1f2937; border-radius: 10px; padding: 12px; }
    .card h3 { margin: 0 0 6px; font-size: 12px; color: var(--muted); }
    .card .value { font-size: 16px; font-weight: 600; }
    .filters { display: flex; gap: 8px; flex-wrap: wrap; margin: 10px 0 14px; }
    .tabs { display: flex; gap: 8px; margin: 6px 0 12px; }
    .btn { background: #1f2937; color: var(--text); border: 1px solid #374151; padding: 6px 10px; border-radius: 8px; font-size: 12px; cursor: pointer; }
    .btn.active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent) inset; }
    .search { background: #0b1220; color: var(--text); border: 1px solid #374151; padding: 6px 10px; border-radius: 8px; font-size: 12px; min-width: 220px; }
    table { border-collapse: collapse; width: 100%; background: var(--table); border: 1px solid #1f2937; border-radius: 10px; overflow: hidden; }
    th, td { border-bottom: 1px solid #1f2937; padding: 10px; font-size: 12px; text-align: left; vertical-align: top; }
    th { background: #111827; color: var(--muted); }
    tr:hover { background: #0f1a2b; }
    .badge { padding: 2px 8px; border-radius: 999px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.4px; }
    .badge.passed { background: rgba(34,197,94,.15); color: var(--pass); }
    .badge.failed { background: rgba(239,68,68,.15); color: var(--fail); }
    .badge.skipped { background: rgba(245,158,11,.15); color: var(--skip); }
    details > summary { cursor: pointer; color: var(--accent); }
    pre { white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #fca5a5; }
  </style>
</head>
<body>
  <header>
    <h1>WDIO Test Report</h1>
    <div class="meta">Run Start: ${runnerStart} • Run End: ${runnerEnd}</div>
  </header>
  <div class="container">
    <div class="cards">
      <div class="card"><h3>Total</h3><div class="value">${total}</div></div>
      <div class="card"><h3>Passed</h3><div class="value" style="color: var(--pass)">${passed}</div></div>
      <div class="card"><h3>Failed</h3><div class="value" style="color: var(--fail)">${failed}</div></div>
      <div class="card"><h3>Skipped</h3><div class="value" style="color: var(--skip)">${skipped}</div></div>
      <div class="card"><h3>Platform</h3><div class="value">${this.escape(platformName)}</div></div>
      <div class="card"><h3>Device</h3><div class="value">${this.escape(deviceName)}</div></div>
      <div class="card"><h3>Version</h3><div class="value">${this.escape(platformVersion)}</div></div>
      <div class="card"><h3>App</h3><div class="value">${this.escape(app)}</div></div>
    </div>
    <div class="tabs">
      <button class="btn active" data-platform="all">All Platforms</button>
      <button class="btn" data-platform="android">Android</button>
      <button class="btn" data-platform="ios">iOS</button>
    </div>
    <div class="filters">
      <button class="btn active" data-filter="all">All</button>
      <button class="btn" data-filter="passed">Passed</button>
      <button class="btn" data-filter="failed">Failed</button>
      <button class="btn" data-filter="skipped">Skipped</button>
      <input class="search" placeholder="Search tests..." />
    </div>
    <table>
    <thead>
      <tr>
        <th>Test</th>
        <th>Status</th>
        <th>Start</th>
        <th>End</th>
        <th>Duration</th>
        <th>Screenshot</th>
        <th>Error</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  </div>
  <script>
    const statusButtons = document.querySelectorAll('.filters .btn');
    const platformButtons = document.querySelectorAll('.tabs .btn');
    const search = document.querySelector('.search');
    const rows = Array.from(document.querySelectorAll('tbody tr'));
    let activeStatus = 'all';
    let activePlatform = 'all';
    const apply = () => {
      const q = (search.value || '').toLowerCase();
      rows.forEach(r => {
        const status = r.getAttribute('data-status');
        const platform = r.getAttribute('data-platform');
        const text = r.innerText.toLowerCase();
        const statusOk = activeStatus === 'all' || status === activeStatus;
        const platformOk = activePlatform === 'all' || platform === activePlatform;
        const searchOk = text.includes(q);
        r.style.display = statusOk && platformOk && searchOk ? '' : 'none';
      });
    };
    statusButtons.forEach(b => b.addEventListener('click', () => {
      statusButtons.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      activeStatus = b.getAttribute('data-filter');
      apply();
    }));
    platformButtons.forEach(b => b.addEventListener('click', () => {
      platformButtons.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      activePlatform = b.getAttribute('data-platform');
      apply();
    }));
    search.addEventListener('input', apply);
  </script>
</body>
</html>`

    fs.writeFileSync(this.outputPath, html, 'utf-8')
  }

  private escape(value: string) {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;')
  }
}
