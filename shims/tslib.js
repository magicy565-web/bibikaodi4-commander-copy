// tslib shim: adds .default export so packages compiled with esModuleInterop work correctly
const tslib = require('tslib');
if (!tslib.default) {
  tslib.default = tslib;
}
module.exports = tslib;
module.exports.default = tslib;
