const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dist = 'docs'

module.exports = {
  mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
  entry: {
    'index': path.resolve(__dirname, './src/', 'index.js'),
    'color-space': path.resolve(__dirname, './src/', 'color-space.js'),
    'color-graph': path.resolve(__dirname, './src/', 'color-graph.js'),
    'circle-color-graph': path.resolve(__dirname, './src/', 'circle-color-graph.js')
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: [/node_modules/],
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ["style-loader", {
          loader: "css-loader",
          options: {
            url: false,
            modules: false
          }
        }]
      },
      {
        test: /\.html$/,
        exclude: [/node_modules/],
        use: [{
          loader: "html-loader",
          options: {
            minimize: true
          }
        }]
      },
      {
        test: /\.(jpg|png)$/,
        loaders: 'url-loader'
      }
    ]
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, dist),
    filename: '[name].min.js'
  },
  serve: {
    open: true,
    port: 8080,
    contentBase: dist,
    content: path.resolve(__dirname, 'public'),
  },
  devServer: {
    hot: true,
    inline: true,
    watchContentBase: true,
    contentBase: path.join(__dirname, 'public'),
    watchContentBase: true,
  },
  plugins: [
    new CopyWebpackPlugin(
      [{
        from: 'src/public',
        to: 'public',
      }, ], {
        context: ''
      }
    ),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      filename: "./index.html",
      chunks: ['index']
    }),
    new HtmlWebpackPlugin({
      template: "src/color-space.html",
      filename: "./color-space.html",
      chunks: ['color-space'],
    }),
    new HtmlWebpackPlugin({
      template: "src/color-graph.html",
      filename: "./color-graph.html",
      chunks: ['color-graph'],
    }),
    new HtmlWebpackPlugin({
      template: "src/circle-color-graph.html",
      filename: "./circle-color-graph.html",
      chunks: ['circle-color-graph'],
    })
  ],
  performance: {
    hints: false
  }
}
