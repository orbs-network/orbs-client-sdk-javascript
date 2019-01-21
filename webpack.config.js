const path = require("path");

const production = process.env.NODE_ENV === "production";
module.exports = {
  mode: production ? "production" : "development",
  devtool: production ? "" : "inline-source-map",
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
