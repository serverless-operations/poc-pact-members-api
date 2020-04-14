const path = require('path')
const slsw = require('serverless-webpack')
const nodeExternals = require('webpack-node-externals')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const entries = Object.keys(slsw.lib.entries)
  .reduce((acc, cur) => Object.assign(acc, {
    [cur]: [path.join(__dirname, './scripts/source-map-install.js'), slsw.lib.entries[cur]]
  }), {})

module.exports = {
  entry: entries,
  target: 'node',
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  externals: [ nodeExternals() ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader'
      }
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js', '.tsx', '.jsx' ],
    plugins: [ new TsconfigPathsPlugin({ configFile: 'tsconfig.json' }) ]
  },
  devtool: 'inline-source-map',
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.built'),
    filename: '[name].js',
  },
}
