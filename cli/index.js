"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.process_file = void 0;
const args_1 = require("./args");
const chalk_1 = __importDefault(require("chalk"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const module_parser_1 = require("../src/module-parser");
const utils_1 = require("../src/utils");
if (typeof require !== "undefined" && require.main === module) {
    process_file(args_1.get_args());
}
function process_file(args) {
    let filetype;
    switch (args.file.slice(-10)) {
        case ".kicad_mod":
            filetype = "module";
            break;
        case ".kicad_pcb":
            filetype = "board";
            break;
        default:
            console.log("Invalid file type. Expected extension '.kicad_mod' or '.kicad_pcb'");
            process.exit(1);
    }
    const mod = fs_extra_1.default.readFileSync(args.file).toString();
    let data;
    try {
        data = module_parser_1.parse(mod, { startRule: filetype });
    }
    catch (err) {
        if (args.verbose)
            console.log(err);
        console.log(`falied to parse module ${args.file}`);
        process.exit(1);
    }
    let sdata;
    try {
        sdata = utils_1.post_process(data);
    }
    catch (err) {
        if (args.verbose)
            console.log(err);
        console.log(chalk_1.default.bgRed.black("Something Went Wrong with post_process"));
        process.exit(1);
    }
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
process.once("SIGINT", () => process.exit(1));
process.once("SIGTERM", () => process.exit(1));
