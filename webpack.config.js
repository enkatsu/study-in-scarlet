const path = require('path')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dist = 'docs'

module.exports = {
  mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
  entry: {
    main: path.resolve(__dirname, './src/', "index.js")
  },
  output: {
    path: path.resolve(__dirname, dist),
    filename: '[name].min.js'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: [/node_modules/],
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        exclude: [/node_modules/],
        use: ["style-loader", {
          loader: "css-loader",
          options: {
            url: false,
            modules: true
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
      }
    ]
  },
  devtool: 'source-map',
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
        from: 'public',
        to: '',
      }, ], {
        context: ''
      }
    ),
    new HtmlWebpackPlugin({
      template: "src/index.html",
      filename: "./index.html"
    })
  ],
  performance: {
    hints: false
  }
}