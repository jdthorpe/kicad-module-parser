"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const through2_1 = __importDefault(require("through2"));
const module_parser_1 = require("../src/module-parser");
const fs_extra_1 = __importDefault(require("fs-extra"));
const klaw_1 = __importDefault(require("klaw"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const chalk_1 = __importDefault(require("chalk"));
const ajv_1 = __importDefault(require("ajv"));
const utils_1 = require("../src/utils");
// ---------------
// constants
// ---------------
const AJV = new ajv_1.default({ strict: false });
const schema = js_yaml_1.default.load(fs_extra_1.default.readFileSync(path_1.default.join(__dirname, "sexp_schema.yaml"), "utf-8"));
// ---------------
// export
// ---------------
let resolver;
const Done = new Promise((resolve) => (resolver = resolve));
exports.default = Done;
// --------------------------------------------------
// process a single file
// --------------------------------------------------
if (process.argv[2]) {
    process_file(process.argv[2]);
    process.exit();
}
// --------------------------------------------------
// process all the files in the data directory
// --------------------------------------------------
klaw_1.default(path_1.default.join(__dirname, "..", "data"))
    .pipe(through2_1.default.obj(function (item, enc, next) {
    if (!item.stats.isDirectory() && item.path.endsWith(".kicad_pcb"))
        this.push(item);
    next();
}))
    .on("data", (item) => process_file(item.path))
    .on("end", () => resolver());
// --------------------------------------------------
// Worker
// --------------------------------------------------
function process_file(filepath) {
    const mod = fs_extra_1.default.readFileSync(filepath).toString();
    let data;
    try {
        data = module_parser_1.parse(mod, { startRule: "board" });
        fs_extra_1.default.writeFileSync(filepath.slice(0, -10) + ".json", JSON.stringify(data, null, 2));
    }
    catch (err) {
        console.log(err);
        console.log(`falied to parse module ${filepath}`);
        process.exit();
    }
    let data_is_valid = true;
    try {
        data_is_valid = AJV.validate(schema, data);
    }
    catch (err) {
        console.log(chalk_1.default.bgRed.black("Something Went Wrong"));
        console.log("Error:", err.message);
        AJV.errors &&
            AJV.errors.map((e) => console.log(`${chalk_1.default.bgGreen(e.dataPath)}: ${chalk_1.default.inverse(e.message)}`));
        return;
    }
    if (!data_is_valid) {
        console.log(JSON.stringify(data.value.at(139).value.at(26).value, null, 2));
        console.log(chalk_1.default.black.bgRed("Data does not follow the schema"), filepath);
        AJV.errors &&
            AJV.errors.map((e, i) => {
                // console.log(e);
                console.log(`'${chalk_1.default.bgBlue(e.instancePath)}': ${chalk_1.default.inverse(e.message)}`);
                if (i < 3) {
                    let _data = data;
                    for (let part of e.instancePath.slice(1).split("/")) {
                        _data = _data[part];
                    }
                    console.log(JSON.stringify(_data, null, 2));
                }
            });
        process.exit();
    }
    let sdata;
    try {
        sdata = utils_1.post_process(data);
    }
    catch (err) {
        console.log(chalk_1.default.bgRed.black("Something Went Wrong with post_process"));
        console.log(err);
        console.log(chalk_1.default.bgRed.white(filepath));
        console.log(data);
        process.exit();
    }
    fs_extra_1.default.writeFileSync(filepath.slice(0, -10) + "_.json", JSON.stringify(Object.fromEntries([[sdata.type, sdata.value]]), null, 2));
}
