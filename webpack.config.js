/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

const path = require("path");

const production = process.env.NODE_ENV === "production";
const libraryName = 'Orbs';

const webConfig = {
  target: 'web',
  mode: production ? "production" : "development",
  devtool: production ? "" : "inline-source-map",
  entry: "./src/index.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: `orbs-client-sdk-web.js`,
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
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

const nodeConfig = {
  target: 'node',
  mode: production ? "production" : "development",
  devtool: production ? "" : "inline-source-map",
  entry: "./src/index.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: `orbs-client-sdk.js`,
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
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

const customCodecConfig = {
  target: 'node',
  mode: production ? "production" : "development",
  devtool: production ? "" : "inline-source-map",
  entry: "./src/codec/Arguments.ts",
  output: {
    path: path.join(__dirname, "dist"),
    filename: `arguments.js`,
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
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

module.exports = [webConfig, nodeConfig, customCodecConfig];