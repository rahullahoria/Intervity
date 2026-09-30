const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'bin',
      'gguf',
      'onnx',
      'pte',
      'txt',
      'sqlite',
      'riv',
    ],
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'react-native/asset-registry') {
        return {
          filePath: path.resolve(
            __dirname,
            'node_modules/react-native/Libraries/Image/AssetRegistry.js'
          ),
          type: 'sourceFile',
        };
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
