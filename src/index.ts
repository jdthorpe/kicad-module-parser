// <reference path="types.d.ts"/>
export * from "./types";
import * as parsers from "./parse";

export const parse = {
  module: (
    x: string,
    format: "compact" | "long" | "bare" = "compact",
    options: any = {},
  ) => parsers.parseModule(x, format, { startRule: "module", ...options }),
  board: (
    x: string,
    format: "compact" | "long" | "bare" = "compact",
    options: any = {},
  ) => parsers.parseModule(x, format, { startRule: "board", ...options }),
  symbol: (
    x: string,
    format: "compact" | "long" | "bare" = "compact",
    options: any = {},
  ) =>
    parsers.parseSymbolVerbose(x, format, {
      startRule: "kicad_symbol_lib",
      ...options,
    }),
};
