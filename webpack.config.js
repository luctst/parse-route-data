const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'node',
  node: {
    global: true,
    __filename: false,
    __dirname: false,
  },
  context: resolve(process.cwd(), 'lib'),
  entry: {
    lib: './index.js'
  },
  output: {
    path: resolve(process.cwd(), 'umd'),
    chunkFilename: '[name]-min.js',
    filename: '[name]-min.js',
  },
  resolve: {
    extensions: [
      '.js',
      '.mjs',
      '.jsx',
      '.vue',
      '.json',
      '.wasm'
    ],
    modules: [
      'node_modules',
    ],
  },
  optimization: {
    minimize: true,
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
        },
        common: {
          name: 'chunk-common',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
  },
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        exclude: [
          function () { /* omitted long function */ }
        ],
        use: [
          {
            loader: '/Users/lucas/Dev/parse-route-data/node_modules/cache-loader/dist/cjs.js',
            options: {
              cacheDirectory: '/Users/lucas/Dev/parse-route-data/node_modules/.cache/babel-loader',
              cacheIdentifier: 'db06973c'
            }
          },
          {
            loader: '/Users/lucas/Dev/parse-route-data/node_modules/babel-loader/lib/index.js'
          }
        ]
      },

    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
    }),
  ],
};