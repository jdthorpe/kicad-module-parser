"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSymbolVerbose = exports.parseModuleVerbose = exports.parseSymbol = exports.parseModule = void 0;
const module_parser_1 = require("./module-parser");
const symbol_parser_1 = require("./symbol-parser");
const utils_1 = require("./utils");
const chalk_1 = __importDefault(require("chalk"));
function parseModule(mod, format, options) {
    return parse(module_parser_1.parse, mod, format, options);
}
exports.parseModule = parseModule;
function parseSymbol(mod, format, options) {
    return parse(symbol_parser_1.parse, mod, format, options);
}
exports.parseSymbol = parseSymbol;
function parseModuleVerbose(mod, format, options) {
    return parse_verbose(module_parser_1.parse, mod, format, options);
}
exports.parseModuleVerbose = parseModuleVerbose;
function parseSymbolVerbose(mod, format, options) {
    return parse_verbose(symbol_parser_1.parse, mod, format, options);
}
exports.parseSymbolVerbose = parseSymbolVerbose;
function parse(parser, mod, format, options) {
    const data = parser(mod, options);
    if (format === "bare")
        return data;
    const sdata = utils_1.post_process(data, format === "long");
    return Object.fromEntries([[sdata.type, sdata.value]]);
}
function parse_verbose(parser, mod, format, options) {
    let data;
    try {
        data = parser(mod, options);
    }
    catch (err) {
        console.log(chalk_1.default.bgRed.black(`Falied to parse module with options: ${JSON.stringify(options)}`));
        throw err;
    }
    if (format === "bare")
        return data;
    let sdata;
    try {
        sdata = utils_1.post_process(data, format === "long");
    }
    catch (err) {
        console.log(chalk_1.default.bgRed.black("Something Went Wrong with post_process"));
        throw err;
    }
    return Object.fromEntries([[sdata.type, sdata.value]]);
}
