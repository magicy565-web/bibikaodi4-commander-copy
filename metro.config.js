const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Fix: moti -> framer-motion -> tslib issue
// Metro resolves tslib to tslib.es6.mjs (ESM with `export default {}`),
// but framer-motion CJS code does `var tslib = require('tslib')` and then
// calls `tslib.__extends(...)` directly. When Metro wraps the ESM default
// export, `tslib` becomes the module namespace object (not the helpers),
// causing "Cannot destructure property '__extends' of 'tslib.default'".
// Fix: force Metro to use the CJS tslib.js instead of the .mjs file.
config.resolver = config.resolver ?? {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  tslib: path.resolve(__dirname, "node_modules/tslib/tslib.js"),
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  forceWriteFileSystem: true,
});
