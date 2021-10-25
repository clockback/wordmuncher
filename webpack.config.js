const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    devServer: {
        hot: true,
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp'
        },
        historyApiFallback: true
    },
    entry: './prokart/src/run.js',
    mode: 'development',
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
                type: 'asset/resource'
            },
            {
                test: /\.wasm$/i,
                type: 'application/wasm'
            }
        ]
    },
    resolve: {
        extensions: ['.dev.js', '.js', '.json', '.wasm'],
        fallback: {
            util: require.resolve("util/"),
            fs: false,
            crypto: false,
            constants: false,
            assert: false,
            http: false
        }
    },
    plugins:[
        new HtmlWebpackPlugin({
            template: './prokart/src/templates/main.html'
        })
    ]
}
