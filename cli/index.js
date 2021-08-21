"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const args_1 = require("./args");
const process_file_1 = require("../src/process-file");
// if (typeof require !== "undefined" && require.main === module)
process_file_1.process_file(args_1.get_args());
process.once("SIGINT", () => process.exit(1));
process.once("SIGTERM", () => process.exit(1));
