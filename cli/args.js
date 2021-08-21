"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_args = void 0;
const argparse_1 = require("argparse");
const path_1 = require("path");
const parser = new argparse_1.ArgumentParser({
    description: "Convert Kicad board and pcb files to JSON/YAML",
});
parser.add_argument("-f", "--file", {
    help: "The Kicad pcb or module file to convert to json",
    required: true,
});
parser.add_argument("-o", "--output", {
    help: "Output file (defaults to input file with '.json' or '.yaml' extension)",
});
parser.add_argument("-v", "--verbose", {
    action: "store_true",
    help: "verbose output",
});
parser.add_argument("--yaml", {
    action: "store_true",
    help: "set output to yaml",
});
function get_args() {
    const args = parser.parse_args();
    args.file = path_1.resolve(path_1.join(process.cwd(), args.file));
    if (args.output)
        args.output = path_1.resolve(path_1.join(process.cwd(), args.output));
    return args;
}
exports.get_args = get_args;
