export class BaseScreen {
  protected async waitForVisible(selector: string, timeout = 15000) {
    const el = await $(selector)
    await el.waitForDisplayed({ timeout })
    return el
  }
}
