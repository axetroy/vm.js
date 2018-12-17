import * as webpack from "webpack";
import * as path from "path";

// webpack.config.js
const webpackConfig: webpack.Configuration = {
  entry: {
    vm: path.join(__dirname, "src", "vm.ts")
  },
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "[name].js",
    libraryTarget: "umd"
  },
  target: "node",
  externals: {
    "babel-types": "babel-types"
  },
  resolve: {
    modules: ["node_modules"],
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        options: {
          configFile: "tsconfig.webpack.json"
        }
      }
    ]
  },
  devtool: "source-map",
  mode: "production",
  plugins: []
};

module.exports = webpackConfig;
