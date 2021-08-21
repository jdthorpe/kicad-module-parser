import { Args, get_args } from "./args";
import chalk from "chalk";
import fse from "fs-extra";
import yaml from "js-yaml";
import { parse } from "../src/module-parser";
import { post_process } from "../src/utils";

if (typeof require !== "undefined" && require.main === module) {
    process_file(get_args());
}

export function process_file(args: Args) {
    let filetype: string;
    switch (args.file.slice(-10)) {
        case ".kicad_mod":
            filetype = "module";
            break;
        case ".kicad_pcb":
            filetype = "board";
            break;
        default:
            console.log(
                "Invalid file type. Expected extension '.kicad_mod' or '.kicad_pcb'"
            );
            process.exit(1);
    }

    const mod: string = fse.readFileSync(args.file).toString();
    let data: any;
    try {
        data = parse(mod, { startRule: filetype });
    } catch (err) {
        if (args.verbose) console.log(err);
        console.log(`falied to parse module ${args.file}`);
        process.exit(1);
    }

    let sdata;
    try {
        sdata = post_process(data);
    } catch (err) {
        if (args.verbose) console.log(err);
        console.log(
            chalk.bgRed.black("Something Went Wrong with post_process")
        );
        process.exit(1);
    }

    if (args.yaml) {
        const outfile = args.output || args.file.slice(0, -10) + ".yaml";
        fse.writeFileSync(outfile, yaml.dump(sdata, { noCompatMode: true }));
    } else {
        const outfile = args.output || args.file.slice(0, -10) + ".json";
        fse.writeFileSync(outfile, JSON.stringify(sdata, null, 2));
    }
}

process.once("SIGINT", () => process.exit(1));
process.once("SIGTERM", () => process.exit(1));
