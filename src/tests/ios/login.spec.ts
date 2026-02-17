import { expect } from '@wdio/globals'
import { loginScreenIOS } from '../../screens/ios/login.screen.js'

describe('iOS Login', () => {
  it('should login with valid credentials', async () => {
    await loginScreenIOS.login('standard_user', 'secret_sauce')
    const productsTitle = await $('~test-PRODUCTS')
    await productsTitle.waitForDisplayed()
    await expect(productsTitle).toBeDisplayed()
  })
})
