/**
 * @format
 */

import { AppRegistry } from 'react-native';
// Polyfill WHATWG URL for libraries like @microsoft/signalr on React Native
import 'react-native-url-polyfill/auto';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
