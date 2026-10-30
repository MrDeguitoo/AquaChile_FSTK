module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: ['karma-jasmine', 'karma-chrome-launcher', 'karma-esbuild'],

    files: [{ pattern: 'src/**/*.test.js', watched: false }],
    preprocessors: {
      'src/**/*.test.js': ['esbuild'],
    },

    esbuild: {
      jsx: 'automatic',
      loader: { '.js': 'jsx', '.jsx': 'jsx' },
      define: { 'process.env.NODE_ENV': '"test"' },
    },

    browsers: ['ChromeHeadless'],
    reporters: ['progress'],
    singleRun: true,
  });
};