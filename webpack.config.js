const path = require('path');
const BundleTracker = require('webpack-bundle-tracker');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    devServer: {
        hot: true,
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp'
        },
        historyApiFallback: true
    },
    entry: {
        wordmuncher: './wordmuncher/src/run.js'
    },
    output: {
        path: path.resolve('./wordmuncher/static/wordmuncher/'),
        filename: '[name]-[hash].js',
        publicPath: 'static/wordmuncher/'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env', '@babel/preset-react']
                }
            },
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.svg$/i,
                exclude: /node_modules/,
                use: ['file-loader?name=[name].[ext]']
            },
            {
                test: /\.mp3$/,
                loader: 'file-loader',
                options: {
                    name: 'static/audio/[name].[hash:8].[ext]'
                }
            }
        ]
    },
    resolve: {
        fallback: {
            util: require.resolve("util/"),
            fs: false,
            crypto: false,
            constants: false,
            assert: false,
            http: false
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new BundleTracker({
            path: __dirname,
            filename: './webpack-stats.json'
        }),
    ]
}
