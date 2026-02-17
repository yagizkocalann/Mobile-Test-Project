import { expect } from '@wdio/globals'
import { loginScreenAndroid } from '../../screens/android/login.screen.js'

describe('Android Login', () => {
  it('should login with valid credentials', async () => {
    await loginScreenAndroid.login('standard_user', 'secret_sauce')
    const productsTitle = await $('~test-PRODUCTS')
    await productsTitle.waitForDisplayed()
    await expect(productsTitle).toBeDisplayed()
  })
})
