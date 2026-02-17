# Mobile Test Automation Base (Appium + WebdriverIO + TypeScript)

iOS ve Android için POM (Page Object Model) yaklaşımıyla hazırlanmış temiz bir başlangıç iskeleti. Bu repo hem test koşmayı hem de yeni test yazmayı hızlı başlatmak için tasarlandı.

## Hızlı Başlangıç
1. Bağımlılıkları kur:
```
npm install
```

2. Appium driver kur:
```
# Android
npx appium driver install uiautomator2

# iOS
npx appium driver install xcuitest
```

3. Uygulama dosyalarını yerleştir:
- Android: `/Applications/android/demo-sauce/app-debug.apk`
- iOS: `/Applications/ios/demo-sauce/MyDemoApp.app`

4. Appium server başlat:
```
export ANDROID_HOME="/Users/yagizkocalan/Library/Android/sdk"
export ANDROID_SDK_ROOT="/Users/yagizkocalan/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"

npx appium --address 127.0.0.1 --port 4723 --base-path /
```

5. Emulator/Simulator aç:
- Android Emulator: Android Studio → Device Manager → `Pixel_8_API_34` → Start
- iOS Simulator: Xcode → Open Developer Tool → Simulator → `iPhone 17 Pro Max` aç

6. Emulator/Simulator açıkken testleri çalıştır:
```
# Android
npm run test:android

# iOS
npm run test:ios
```

## Gereksinimler
- Node.js 20 LTS
- Xcode + iOS Simulator
- Android Studio + Android Emulator
- Appium 3 (proje içinde `appium@^3`)

## Dizin Yapısı
- `config/`: Platform bazlı WDIO konfigürasyonları
- `src/screens/android/`: Android POM ekranları
- `src/screens/ios/`: iOS POM ekranları
- `src/tests/android/`: Android testleri
- `src/tests/ios/`: iOS testleri
- `src/utils/`: Ortak yardımcı fonksiyonlar
- `data/`: Test verileri
- `reports/`: HTML rapor ve screenshot çıktı klasörü

## Demo Uygulama (Öneri)
Sauce Labs demo uygulaması (iOS/Android) ile hızlıca başlarsın.

```
Android APK:
https://github.com/saucelabs/sample-app-mobile/releases

iOS .app / .zip:
https://github.com/saucelabs/sample-app-mobile/releases
```

> Not: iOS için `.ipa` simülatörde çalışmaz. `.zip` içinden çıkan `.app` klasörünü kullan.

## Konfigürasyon
Android ve iOS için cihaz bilgileri `config/wdio.android.conf.ts` ve `config/wdio.ios.conf.ts` içinde bulunur.

Önemli alanlar:
- `appium:deviceName`
- `appium:platformVersion`
- `appium:app`
- Android için: `appium:appPackage`, `appium:appActivity`

## Appium Inspector Capabilities (Örnek)
Android (senin ortamına göre güncel):
```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Pixel_8_API_34",
  "appium:platformVersion": "14",
  "appium:app": "/Applications/android/demo-sauce/app-debug.apk",
  "appium:newCommandTimeout": 120,
  "appium:appWaitPackage": "com.swaglabsmobileapp",
  "appium:appWaitActivity": ".MainActivity"
}
```

iOS (örnek, iOS tarafında `appWaitActivity` yoktur):
```json
{
  "platformName": "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone 17 Pro Max",
  "appium:platformVersion": "26.2",
  "appium:app": "/Applications/ios/demo-sauce/MyDemoApp.app",
  "appium:newCommandTimeout": 120
}
```

## Raporlama (HTML)
Her test koşusundan sonra aynı dosya güncellenir:
- `reports/report.html`
Kısa yol:
- `report/index.html`

Ek özellikler:
- Koşu başlangıç/bitiş zamanı
- Her test için başlangıç/bitiş zamanı, süre, durum ve hata mesajı
- Fail testlerde otomatik screenshot (`reports/screenshots/`)
- Filtreleme ve platform tabları (Android/iOS)

## Sık Karşılaşılan Sorunlar
- **ADB bulunamıyor**
  - `ANDROID_HOME` ve `ANDROID_SDK_ROOT` değerlerini doğru set ettiğinden emin ol.
  - `which adb` çıktısı `/Users/yagizkocalan/Library/Android/sdk/platform-tools/adb` olmalı.

- **Appium Inspector /wd/hub hatası**
  - Appium 3’te path `/` olmalı.

- **Android activity hatası**
  - `appium:appPackage` ve `appium:appActivity` değerlerini doğru gir.
  - Aktif activity bulmak için:
    - `adb shell dumpsys window | grep -E "mCurrentFocus|mFocusedApp"`

## Notlar
- POM yapısı platformlara göre ayrıldı: `src/screens/android` ve `src/screens/ios`
- Ortak ekranlar/akışlar ileride `src/screens/shared` altında birleştirilebilir.
