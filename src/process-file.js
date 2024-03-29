"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process_file = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const parse_1 = require("./parse");
function process_file(args) {
    let filetype;
    let parser;
    switch (args.file.slice(-10)) {
        case ".kicad_mod":
            filetype = "module";
            parser = parse_1.parseModuleVerbose;
            break;
        case ".kicad_pcb":
            filetype = "board";
            parser = parse_1.parseModuleVerbose;
            break;
        case ".kicad_sym":
            filetype = "kicad_symbol_lib";
            parser = parse_1.parseSymbolVerbose;
            break;
        default:
            throw "Invalid file type. Expected extension '.kicad_mod' or '.kicad_pcb'";
    }
    const mod = fs_extra_1.default.readFileSync(args.file).toString();
    let sdata;
    sdata = parser(mod, args.format, { startRule: filetype });
    if (args.yaml) {
        const outfile = args.output || args.file.slice(0, -10) + ".yaml";
        fs_extra_1.default.writeFileSync(outfile, js_yaml_1.default.dump(sdata, { noCompatMode: true }));
    }
    else {
        const outfile = args.output || args.file.slice(0, -10) + ".json";
        fs_extra_1.default.writeFileSync(outfile, JSON.stringify(sdata, null, 2));
    }
}
exports.process_file = process_file;
