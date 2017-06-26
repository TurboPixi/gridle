var path = require('path')
module.exports = {
  extends: ['airbnb',
            'plugin:import/errors',
            'plugin:import/warnings'],
  settings: {
    "import/resolver": {
      webpack: {
        config: {
          resolve: {
            extensions: ['.js'],
            modules: [
              path.resolve('../src'),
              path.resolve('../vendor/node_modules')
            ],
            alias: {
              lib: path.join(process.cwd(), 'src'),
            },
          },
        }
      }
    }
  },

  env: {
    es6: true,
    browser: true,
  },

  rules: {
    "arrow-parens": [2, 'always'],
    "class-methods-use-this": [0],
    "consistent-return": [0],
    "curly": ["error", "all"],
    "id-length": [2, { exceptions: ['a', 'b', 'i', 'j', 'x', 'y', 'z', 'w', 'h', 'f', 'r', 't'] }],
    "import/extensions": [2, "always", { "js": "never" }],
    "max-len": [2, 120, 4],
    "no-magic-numbers": [0],
    "no-mixed-operators": [0],
    "no-param-reassign": [0],
    "space-unary-ops": [2],
  },

  parser: 'babel-eslint',
}
