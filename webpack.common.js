const path = require('path')

module.exports = {
  entry: ['@babel/polyfill', path.join(__dirname, 'client/src/index.js')],
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
          presets: ['@babel/preset-env', '@babel/react'],
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