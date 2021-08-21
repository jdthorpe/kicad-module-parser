"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.parse_module = void 0;
// <reference path="types.d.ts"/>
__exportStar(require("./types"), exports);
var extract_module_details_1 = require("./src/extract-module-details");
Object.defineProperty(exports, "parse_module", { enumerable: true, get: function () { return extract_module_details_1.parse_module; } });
const module_parser_1 = require("./src/module-parser");
exports.parse = {
    module: (x, options) => module_parser_1.parse(x, { startRule: "module", ...options }),
    board: (x, options) => module_parser_1.parse(x, { startRule: "board", ...options }),
};
