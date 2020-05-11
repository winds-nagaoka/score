const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: path.join(__dirname, 'client/src/index.js'),
  output: {
    path: path.join(__dirname, 'client/build'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['es2015', 'react'],
          compact: true
        }
      },
      {
        test: /\.css$/,
        use: [
          require.resolve('style-loader'),
          {
            loader: require.resolve('css-loader'),
            options: {
              importLoaders: 1,
            },
          },
        ]
      },
      {
        test: /\.svg$/,
        loader: 'svg-react-loader'
      }
    ]
  },
}