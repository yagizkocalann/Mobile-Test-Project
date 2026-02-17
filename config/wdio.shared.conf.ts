import type { Options } from '@wdio/types'
import fs from 'node:fs'
import path from 'node:path'
import HtmlReporter from '../src/utils/html-reporter.js'

export const sharedConfig: Options.Testrunner = {
  runner: 'local',
  specs: [],
  maxInstances: 1,
  logLevel: 'info',
  bail: 0,
  baseUrl: '',
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 0,
  services: ['appium'],
  framework: 'mocha',
  reporters: [
    'spec',
    [HtmlReporter, { outputDir: 'reports', filename: 'report.html' }]
  ],
  afterTest: async (test, _context, result) => {
    if (!result.passed) {
      try {
        const screenshotsDir = path.resolve(process.cwd(), 'reports/screenshots')
        fs.mkdirSync(screenshotsDir, { recursive: true })
        const safeTitle = test.title.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 80)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `${safeTitle}-${timestamp}.png`
        const filePath = path.join(screenshotsDir, filename)
        await browser.saveScreenshot(filePath)
        ;(test as unknown as { screenshot?: string }).screenshot = `screenshots/${filename}`
      } catch {
        // ignore screenshot failures
      }
    }
  },
  mochaOpts: {
    ui: 'bdd',
    timeout: 300000,
    retries: 0
  }
}
