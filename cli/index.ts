import { get_args } from "./args";
import { process_file } from "../src/process-file";

// if (typeof require !== "undefined" && require.main === module)
process_file(get_args());

process.once("SIGINT", () => process.exit(1));
process.once("SIGTERM", () => process.exit(1));
