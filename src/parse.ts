import { parse as _parseModule } from "./module-parser";
import { parse as _parseSymbol } from "./symbol-parser";

import { post_process } from "./utils";
import { n_container } from "./types";
import chalk from "chalk";
interface options {
  startRule: "module" | "board";
  [prop: string]: any;
}

export function parseModule(
  mod: string,
  format: "compact" | "long" | "bare",
  options: options,
) {
  return parse(_parseModule, mod, format, options);
}

export function parseSymbol(
  mod: string,
  format: "compact" | "long" | "bare",
  options: options,
) {
  return parse(_parseSymbol, mod, format, options);
}

export function parseModuleVerbose(
  mod: string,
  format: "compact" | "long" | "bare",
  options: options,
) {
  return parse_verbose(_parseModule, mod, format, options);
}

export function parseSymbolVerbose(
  mod: string,
  format: "compact" | "long" | "bare",
  options: options,
) {
  return parse_verbose(_parseSymbol, mod, format, options);
}

function parse(
  parser: (x: string, options?: any) => n_container,
  mod: string,
  format: "compact" | "long" | "bare",
  options: options,
) {
  const data: n_container = parser(mod, options);
  if (format === "bare") return data;
  const sdata = post_process(data, format === "long");
  return Object.fromEntries([[sdata.type, sdata.value]]);
}

function parse_verbose(
  parser: (x: string, options?: any) => n_container,
  mod: string,
  format: "compact" | "long" | "bare",
  options: options,
) {
  let data: n_container;

  try {
    data = parser(mod, options);
  } catch (err) {
    console.log(
      chalk.bgRed.black(
        `Falied to parse module with options: ${JSON.stringify(options)}`,
      ),
    );
    throw err;
  }
  if (format === "bare") return data;

  let sdata;
  try {
    sdata = post_process(data, format === "long");
  } catch (err) {
    console.log(chalk.bgRed.black("Something Went Wrong with post_process"));
    throw err;
  }
  return Object.fromEntries([[sdata.type, sdata.value]]);
}
