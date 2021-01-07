const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        popup: path.join(__dirname, "src/popup.jsx"),
        background: path.join(__dirname, "src/background.js"),
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: "babel-loader",
                },
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader', 'css-loader'
                ]
            }
        ]
    },
    resolve: {
        extensions: ["*", ".js", ".jsx"]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: "src/common", to: "." },
                { from: "src/popup.html", to: "popup.html" }
            ],
        }),
    ],
};
