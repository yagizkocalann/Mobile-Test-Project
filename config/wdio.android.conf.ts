import type { Options } from '@wdio/types'
import path from 'node:path'
import { sharedConfig } from './wdio.shared.conf.js'

const androidSdkRoot = '/Users/yagizkocalan/Library/Android/sdk'
process.env.ANDROID_HOME = androidSdkRoot
process.env.ANDROID_SDK_ROOT = androidSdkRoot
process.env.PATH = `${androidSdkRoot}/platform-tools:${androidSdkRoot}/emulator:${process.env.PATH ?? ''}`

export const config: Options.Testrunner = {
  ...sharedConfig,
  specs: [path.resolve(process.cwd(), 'src/tests/android/**/*.spec.ts')],
  capabilities: [
    {
      platformName: 'Android',
      'appium:deviceName': 'Pixel_8_API_34',
      'appium:platformVersion': '14',
      'appium:automationName': 'UiAutomator2',
      'appium:app': '/Applications/android/demo-sauce/app-debug.apk',
      'appium:adbExecutable': '/Users/yagizkocalan/Library/Android/sdk/platform-tools/adb',
      'appium:androidSdkRoot': '/Users/yagizkocalan/Library/Android/sdk',
      'appium:appPackage': 'com.swaglabsmobileapp',
      'appium:appActivity': '.MainActivity',
      'appium:appWaitPackage': 'com.swaglabsmobileapp',
      'appium:appWaitActivity': '.MainActivity',
      'appium:appWaitDuration': 30000,
      'appium:newCommandTimeout': 120,
      'appium:autoGrantPermissions': true
    }
  ]
}
