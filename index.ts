// <reference path="types.d.ts"/>
export * from "./types";
import { parse as _parse } from "./src/parse";

export const parse = {
    module: (
        x: string,
        options: any = {},
        format: "compact" | "long" | "bare" = "compact"
    ) => _parse(x, { startRule: "module", ...options }, format),
    board: (
        x: string,
        options: any = {},
        format: "compact" | "long" | "bare" = "compact"
    ) => _parse(x, { startRule: "board", ...options }, format),
};
