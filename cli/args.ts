import { ArgumentParser } from "argparse";
import { resolve, join } from "path";

const parser = new ArgumentParser({
    description: "Convert Kicad board and module files to JSON/YAML",
});

parser.add_argument("file", {
    help: "The Kicad board or module file to convert to json",
});

parser.add_argument("-o", "--output", {
    help: "Output file (defaults to input file with '.json' or '.yaml' extension)",
});

parser.add_argument("-f", "--format", {
    help: "Set the output format",
    default: "compact",
    choices: ["compact", "long", "bare"],
});

parser.add_argument("-v", "--verbose", {
    action: "store_true",
    help: "verbose output",
});

parser.add_argument("--yaml", {
    action: "store_true",
    help: "set output to yaml",
});

export interface Args {
    file: string;
    output: string;
    verbose: boolean;
    yaml: boolean;
    format: "compact" | "long" | "bare";
}

export function get_args(): Args {
    const args = parser.parse_args();
    args.file = resolve(join(process.cwd(), args.file));
    if (args.output) args.output = resolve(join(process.cwd(), args.output));
    return args;
}
