module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@core': './src/core',
          '@components': './src/components',
          '@screens': './src/screens',
          '@database': './src/database',
          '@analytics': './src/analytics',
          '@hooks': './src/hooks',
          '@theme': './src/theme',
          '@types': './src/types',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
