const path = require("path");

module.exports = {
    entry: "./src/index.tsx",
    mode: "production",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false },
                        },
                    },
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
                exclude: /node_modules/,
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: ["file-loader"],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "..", "extension", "popup", "build"),
    },
};