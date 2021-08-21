// <reference path="types.d.ts"/>
export * from "./types";
export { parse_module } from "./src/extract-module-details";
import { parse as _parse } from "./src/module-parser";

export const parse = {
    module: (x: string, options: any) =>
        _parse(x, { startRule: "module", ...options }),
    board: (x: string, options: any) =>
        _parse(x, { startRule: "board", ...options }),
};
