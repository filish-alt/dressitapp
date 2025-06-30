module.exports = {
  presets: [
    ['module:metro-react-native-babel-preset', {
      enableFlowComments: true,
    }],
    ['@babel/preset-flow', {
      allowDeclareFields: true,
    }]
  ],
  plugins: [
    '@babel/plugin-syntax-flow',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './',
          '@/components': './components',
          '@/constants': './constants',
          '@/app': './app',
          '@/assets': './assets',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};

