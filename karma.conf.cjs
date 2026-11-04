module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-esbuild'),
      require('karma-chrome-launcher'),
      require('karma-coverage'),
    ],
    files: [
      { pattern: 'src/**/*.spec.{js,jsx}', watched: false },
      { pattern: 'src/**/*.test.{js,jsx}', watched: false },
    ],
    preprocessors: {
      'src/**/*.{spec,test}.{js,jsx}': ['esbuild'],
    },
    esbuild: {
      jsx: 'automatic',
      loader: { '.js': 'jsx' },
      define: { 'process.env.NODE_ENV': '"test"' },
    },
    reporters: ['progress', 'coverage'],
    coverageReporter: { type: 'html', dir: 'coverage/' },
    browsers: ['ChromeHeadless'],
    singleRun: true,
  });
};
