// <reference path="types.d.ts"/>
export * from "./types";
import { parse as _parse } from "./src/parse";

export const parse = {
    module: (
        x: string,
        format: "compact" | "long" | "bare" = "compact",
        options: any = {}
    ) => _parse(x, format, { startRule: "module", ...options }),
    board: (
        x: string,
        format: "compact" | "long" | "bare" = "compact",
        options: any = {}
    ) => _parse(x, format, { startRule: "board", ...options }),
};
