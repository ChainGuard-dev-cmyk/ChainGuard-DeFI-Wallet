const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    
    entry: {
      popup: './packages/chrome-extension/src/popup/index.tsx',
      background: './packages/chrome-extension/src/background/service-worker.ts',
      content: './packages/chrome-extension/src/content/injector.ts'
    },

    output: {
      path: path.resolve(__dirname, 'dist/chrome-extension'),
      filename: '[name]/[name].js',
      clean: true
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      alias: {
        '@chain-guard/core': path.resolve(__dirname, 'packages/core/src'),
        '@chain-guard/shared': path.resolve(__dirname, 'packages/shared'),
        '@chain-guard/chrome-extension': path.resolve(__dirname, 'packages/chrome-extension/src')
      }
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          type: 'asset/resource'
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './packages/chrome-extension/public/popup.html',
        filename: 'popup/index.html',
        chunks: ['popup']
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'packages/chrome-extension/manifest.json',
            to: 'manifest.json'
          },
          {
            from: 'packages/chrome-extension/public/icons',
            to: 'icons',
            noErrorOnMissing: true
          }
        ]
      })
    ],

    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10
          },
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true
          }
        }
      }
    },

    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};
