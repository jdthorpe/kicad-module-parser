"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse_verbose = exports.parse = void 0;
const module_parser_1 = require("./module-parser");
const utils_1 = require("./utils");
const chalk_1 = __importDefault(require("chalk"));
function parse(mod, format, options) {
    const data = module_parser_1.parse(mod, options);
    if (format === "bare")
        return data;
    const sdata = utils_1.post_process(data, format === "long");
    return Object.fromEntries([[sdata.type, sdata.value]]);
}
exports.parse = parse;
function parse_verbose(mod, format, options) {
    let data;
    try {
        data = module_parser_1.parse(mod, options);
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
exports.parse_verbose = parse_verbose;
