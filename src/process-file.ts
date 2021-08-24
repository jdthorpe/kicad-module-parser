import fse from "fs-extra";
import yaml from "js-yaml";
import { Args } from "../cli/args";
import { parse_verbose } from "./parse";

export function process_file(args: Args) {
    let filetype: "module" | "board";
    switch (args.file.slice(-10)) {
        case ".kicad_mod":
            filetype = "module";
            break;
        case ".kicad_pcb":
            filetype = "board";
            break;
        default:
            throw "Invalid file type. Expected extension '.kicad_mod' or '.kicad_pcb'";
    }

    const mod: string = fse.readFileSync(args.file).toString();
    let sdata: any;
    sdata = parse_verbose(mod, args.format, { startRule: filetype });

    if (args.yaml) {
        const outfile = args.output || args.file.slice(0, -10) + ".yaml";
        fse.writeFileSync(outfile, yaml.dump(sdata, { noCompatMode: true }));
    } else {
        const outfile = args.output || args.file.slice(0, -10) + ".json";
        fse.writeFileSync(outfile, JSON.stringify(sdata, null, 2));
    }
}
