import { BaseScreen } from '../base.screen.js'

class LoginScreenAndroid extends BaseScreen {
  get usernameInput() { return $('~test-Username') }
  get passwordInput() { return $('~test-Password') }
  get loginButton() { return $('~test-LOGIN') }

  async login(username: string, password: string) {
    const usernameEl = await this.waitForVisible('~test-Username')
    const passwordEl = await this.waitForVisible('~test-Password')
    const loginEl = await this.waitForVisible('~test-LOGIN')

    if (!(await usernameEl.isDisplayed())) {
      throw new Error('Login screen not ready: username field not visible')
    }

    await usernameEl.setValue(username)
    await passwordEl.setValue(password)
    await loginEl.click()
  }
}

export const loginScreenAndroid = new LoginScreenAndroid()
