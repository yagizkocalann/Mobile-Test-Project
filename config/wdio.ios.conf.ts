import type { Options } from '@wdio/types'
import path from 'node:path'
import { sharedConfig } from './wdio.shared.conf.js'

export const config: Options.Testrunner = {
  ...sharedConfig,
  specs: [path.resolve(process.cwd(), 'src/tests/ios/**/*.spec.ts')],
  capabilities: [
    {
      platformName: 'iOS',
      'appium:deviceName': 'iPhone 17 Pro Max',
      'appium:platformVersion': '26.2',
      'appium:automationName': 'XCUITest',
      'appium:app': '/Applications/ios/demo-sauce/MyDemoApp.app',
      'appium:newCommandTimeout': 120
    }
  ]
}
