// Use Expo Router's default entry point with polyfills for React Native Web

// Polyfill requestAnimationFrame for React Native Web
if (typeof global.requestAnimationFrame === 'undefined') {
  if (typeof global.performance === 'undefined') {
    // @ts-ignore
    global.performance = { now: () => Date.now() };
  }
  global.requestAnimationFrame = (callback: FrameRequestCallback): number => {
    return setTimeout(() => callback(performance.now()), 0) as unknown as number;
  };
  global.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}

// Import gesture handler and reanimated to ensure they're initialized
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import 'expo-router/entry';
