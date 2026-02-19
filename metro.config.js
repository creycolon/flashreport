const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript files are resolved
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs'];
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'ts' && ext !== 'tsx');

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

// Filter out worklets version mismatch warnings
config.transformer = config.transformer || {};
config.transformer.minifierConfig = config.transformer.minifierConfig || {};
config.reporter = {
  update: (event) => {
    if (event.type === 'client_log' && event.data && event.data.level === 'warn') {
      const message = event.data.data && event.data.data[0];
      if (typeof message === 'string' && message.includes('Mismatch between JavaScript part and native part of Worklets')) {
        return; // Ignore this warning
      }
    }
    // Default logging
    console.log(event);
  }
};

module.exports = config;
