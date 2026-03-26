const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Fix: axios resolves to Node.js entry point which requires 'crypto'.
// Force Metro to use the browser bundle instead.
// See: https://github.com/axios/axios/issues/6899
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'crypto' || moduleName === 'url' || moduleName === 'http' || moduleName === 'https' || moduleName === 'stream' || moduleName === 'zlib' || moduleName === 'assert') {
    return { type: 'empty' };
  }
  // Force axios to use browser build
  if (moduleName === 'axios' || moduleName.startsWith('axios/')) {
    const browserPath = path.resolve(__dirname, 'node_modules/axios/dist/browser/axios.cjs');
    return {
      filePath: browserPath,
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
