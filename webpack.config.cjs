
console.log("> Webpack production script loaded\n");

const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/index.jsx',
  output: {
    library: "EssrDictation",
    libraryTarget: "umd",
    filename: 'essr-dictation.js',
    path: path.resolve(__dirname, 'dist'),
  },
  externals: {
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: 'React',
    },
    'react-dom': {
      commonjs: 'react-dom',
      commonjs2: 'react-dom',
      amd: 'react-dom',
      root: 'ReactDOM',
    },
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
};
