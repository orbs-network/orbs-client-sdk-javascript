const path = require("path");

module.exports = {
  mode: "production",
  entry: ["./src/index.ts"],
  output: {
    path: path.join(__dirname, "dist"),
    filename: `orbs-client-sdk.js`,
    library: "Orbs",
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: ["babel-loader"],
      },
    ],
  },
};
