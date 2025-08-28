This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.

## Installation Guide

### 2.1 System Requirements

#### 2.1.2 Mobile Application (Android & iOS)

##### Android

| **Category** | **Minimum** | **Recommended** |
| --- | --- | --- |
| Internet connection | Wi‑Fi/3G/4G/5G, stable | Wi‑Fi (≥16 Mbps) |
| Operating system | Android 7.0 (API 24) | Android 12+ (API 31+) |
| Target API level | API 35 | Latest API |
| Processor | ARMv7/ARM64; x86 for emulator | Modern ARM64 |
| Memory (RAM) | 2 GB | 4 GB+ |
| Storage | 300 MB free | 1 GB free |
| Notes | Requires Google Play services for Google Sign‑In; supports `armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64` |  |

Source: `android/build.gradle` (minSdkVersion 24, targetSdkVersion 35), `gradle.properties` (CPU architectures).

##### iOS

| **Category** | **Minimum** | **Recommended** |
| --- | --- | --- |
| Operating system | iOS 15.1 | iOS 16+ |
| Internet connection | Wi‑Fi/4G/5G | Wi‑Fi (≥16 Mbps) |
| Processor | Device compatible with iOS 15.1 | Newer iPhone/iPad |
| Memory (RAM) | 2 GB | 3 GB+ |
| Storage | 300 MB free | 1 GB free |
| Permissions | Camera, Photos, Microphone, Files (select photos/videos, upload CV) |  |

Source: `ios/JobFinderApp.xcodeproj/project.pbxproj` (IPHONEOS_DEPLOYMENT_TARGET 15.1). The app uses: `react-native-image-picker`, `react-native-video`, `react-native-document-picker`, `react-native-permissions`, `@react-native-google-signin/google-signin`.