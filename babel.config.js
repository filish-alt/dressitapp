module.exports = function(api) {
  api.cache(true);
  
  return {
    presets: [
      'babel-preset-expo',
    ],
    plugins: [
      [
        '@babel/plugin-transform-runtime',
        {
          helpers: true,
          regenerator: true,
          corejs: false,
          useESModules: false,
        },
      ],
      'react-native-reanimated/plugin', // Keep Reanimated plugin if used
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: [
            '.ios.ts',
            '.android.ts',
            '.ts',
            '.ios.tsx',
            '.android.tsx',
            '.tsx',
            '.jsx',
            '.js',
            '.json',
          ],
          alias: {
            '@': './',
            '@/components': './components',
            '@/constants': './constants',
            '@/app': './app',
            '@/assets': './assets',
          },
        },
      ],
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'], // Remove console.log in production
      },
    },
  };
};

