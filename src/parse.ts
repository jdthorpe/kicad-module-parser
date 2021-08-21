import { parse as _parse } from "./module-parser";
import { post_process } from "./utils";
import { n_container } from "../types";
import chalk from "chalk";

interface options {
    filetype: "module" | "board";
    [prop: string]: any;
}

export function parse(mod: string, options: options) {
    const data: n_container = _parse(mod, options);
    const sdata = post_process(data);
    return Object.fromEntries([[sdata.type, sdata.value]]);
}

export function parse_verbose(mod: string, options: options) {
    let data: n_container;

    try {
        data = _parse(mod, options);
    } catch (err) {
        console.log(chalk.bgRed.black(`Falied to parse module`));
        throw err;
    }

    let sdata;
    try {
        sdata = post_process(data);
    } catch (err) {
        console.log(
            chalk.bgRed.black("Something Went Wrong with post_process")
        );
        throw err;
    }
    return Object.fromEntries([[sdata.type, sdata.value]]);
}
