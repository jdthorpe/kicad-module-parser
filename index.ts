// <reference path="types.d.ts"/>
export * from "./types";
import { parse as _parse } from "./src/parse";

export const parse = {
    module: (x: string, options: any) =>
        _parse(x, { startRule: "module", ...options }),
    board: (x: string, options: any) =>
        _parse(x, { startRule: "board", ...options }),
};
