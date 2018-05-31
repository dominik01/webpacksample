var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname,'dist')
    },
    resolve: {
        modules: [
            'node_modules',
            './src'
        ],
        alias : {
            'cookie' : 'cookie-monster',
            'pubsub' : 'pubsub-js',
            'conditioner' : 'conditioner-core'
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        })
    ]
};