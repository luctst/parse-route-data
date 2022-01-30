const { resolve } = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
    lib: './index.js',
  },
  output: {
    path: resolve(process.cwd(), 'umd'),
    chunkFilename: '[name]-min.js',
    filename: '[name]-min.js',
    library: '', 
    libraryTarget: 'commonjs-module'
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
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            '@babel/preset-env'
          ],
        }
      },

    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      verbose: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './',
          to: 'build'
        }
      ],
    }),
  ],
};