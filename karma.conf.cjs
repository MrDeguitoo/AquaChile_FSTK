const karmaViteRaw = require('karma-vite');

const vitePlugin = karmaViteRaw['framework:vite']
? karmaViteRaw
: (karmaViteRaw.default || karmaViteRaw);

module.exports = function (config) {
    config.set({
        frameworks: ['jasmine', 'vite'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-coverage'),
            vitePlugin
        ],
        files: [
            { pattern: 'src/test/**/*.spec.jsx', type: 'module' }
        ],
        preprocessors: {
            'src/test/**/*.spec.jsx': ['vite']
        },
        reporters: ['progress', 'coverage'],
        coverageReporter: {
            type: 'html',
            dir: 'coverage/'
        },
        browsers: ['ChromeHeadless'],
        singleRun: true
    });
}