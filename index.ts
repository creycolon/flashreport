// Import polyfill first to ensure navigator and clipboard exist before any other imports
console.error('🟪 INDEX.TS: Starting application - importing polyfill');
import './src/polyfill';
console.error('🟪 INDEX.TS: Polyfill imported - importing react-native-reanimated');

// Import react-native-reanimated for animations and gestures
import 'react-native-reanimated';

import { registerRootComponent } from 'expo';
import App from './App';

// Add global error handler to catch and log errors
if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error, isFatal) => {
    console.error('Global error handler:', error, isFatal);
    console.error('Error stack:', error?.stack);
    // You can also send error to analytics here
    originalHandler(error, isFatal);
  });
}

// Catch unhandled promise rejections
if (typeof process !== 'undefined' && process.on) {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
}

// Catch console errors (web)
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('error', (event) => {
    console.error('Global window error:', event.error, event.message, event.filename, event.lineno, event.colno);
  });
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
