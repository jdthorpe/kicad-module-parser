import { parse as _parse } from "./module-parser";
import { post_process } from "./utils";
import { n_container } from "../types";
import chalk from "chalk";
interface options {
    startRule: "module" | "board";
    [prop: string]: any;
}

export function parse(
    mod: string,
    options: options,
    format: "compact" | "long" | "bare"
) {
    const data: n_container = _parse(mod, options);
    if (format === "bare") return data;
    const sdata = post_process(data, format === "long");
    return Object.fromEntries([[sdata.type, sdata.value]]);
}

export function parse_verbose(
    mod: string,
    options: options,
    format: "compact" | "long" | "bare"
) {
    let data: n_container;

    try {
        data = _parse(mod, options);
    } catch (err) {
        console.log(
            chalk.bgRed.black(
                `Falied to parse module with options: ${JSON.stringify(
                    options
                )}`
            )
        );
        throw err;
    }
    if (format === "bare") return data;

    let sdata;
    try {
        sdata = post_process(data, format === "long");
    } catch (err) {
        console.log(
            chalk.bgRed.black("Something Went Wrong with post_process")
        );
        throw err;
    }
    return Object.fromEntries([[sdata.type, sdata.value]]);
}
