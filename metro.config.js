const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure TypeScript files are resolved
config.resolver.sourceExts = ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs'];
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'ts' && ext !== 'tsx');

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
