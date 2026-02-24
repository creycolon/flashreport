const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure path aliases for TypeScript
config.resolver.extraNodeModules = {
  '@core': path.resolve(__dirname, 'src/core'),
  '@ui': path.resolve(__dirname, 'src/ui'),
  '@features': path.resolve(__dirname, 'src/features'),
  '@platforms': path.resolve(__dirname, 'src/platforms'),
  '@app': path.resolve(__dirname, 'app'),
  // Fix for expo-asset resolution error
  'expo-asset': path.resolve(__dirname, 'node_modules/expo/node_modules/expo-asset'),
  'expo-font': path.resolve(__dirname, 'node_modules/expo-font'),
};

// Ensure platform resolution works for web
config.resolver.platforms = ['ios', 'android', 'web'];

module.exports = config;
