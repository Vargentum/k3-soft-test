const path = require('path')

module.exports = {
  module: {
    loaders: [{
      test: /\.styl$/,
      loaders: ['style', 'css', 'stylus?sourceMap&resolve url'],
    },{
      test: /\.json?/,
      loader : 'json'
    }]
  }
}