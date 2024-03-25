"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var through2_1 = __importDefault(require("through2"));
var symbol_parser_1 = require("../src/symbol-parser");
var fs_extra_1 = __importDefault(require("fs-extra"));
var klaw_1 = __importDefault(require("klaw"));
var path_1 = __importDefault(require("path"));
var js_yaml_1 = __importDefault(require("js-yaml"));
var chalk_1 = __importDefault(require("chalk"));
var ajv_1 = __importDefault(require("ajv"));
var utils_1 = require("../src/utils");
// ---------------
// constants
// ---------------
var AJV = new ajv_1["default"]({ strict: false });
var schema = js_yaml_1["default"].load(fs_extra_1["default"].readFileSync(path_1["default"].join(__dirname, "sexp_schema.yaml"), "utf-8"));
// ---------------
// export
// ---------------
var resolver;
var Done = new Promise(function (resolve) { return (resolver = resolve); });
exports["default"] = Done;
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
klaw_1["default"](path_1["default"].join(__dirname, "..", "data"))
    .pipe(through2_1["default"].obj(function (item, enc, next) {
    if (!item.stats.isDirectory() && item.path.endsWith(".kicad_sym"))
        this.push(item);
    next();
}))
    .on("data", function (item) { return process_file(item.path); })
    .on("end", function () { return resolver(); });
// --------------------------------------------------
// process all the files in the data directory
// --------------------------------------------------
function process_file(filepath) {
    var mod = fs_extra_1["default"].readFileSync(filepath).toString();
    var data;
    try {
        data = symbol_parser_1.parse(mod, { startRule: "kicad_symbol_lib" });
        fs_extra_1["default"].writeFileSync(filepath.slice(0, -10) + ".json", JSON.stringify(data, null, 2));
    }
    catch (err) {
        console.log(err);
        console.log("falied to parse symbol " + filepath);
        process.exit();
    }
    var data_is_valid = true;
    try {
        data_is_valid = AJV.validate(schema, data);
    }
    catch (err) {
        console.log(chalk_1["default"].bgRed.black("Something Went Wrong"));
        console.log("Error:", err.message);
        AJV.errors &&
            AJV.errors.map(function (e) {
                return console.log(chalk_1["default"].bgGreen(e.dataPath) + ": " + chalk_1["default"].inverse(e.message));
            });
        return;
    }
    if (!data_is_valid) {
        console.log(chalk_1["default"].black.bgRed("Data does not follow the schema"), filepath);
        AJV.errors &&
            AJV.errors.map(function (e, i) {
                var e_1, _a;
                console.log("'" + chalk_1["default"].bgBlue(e.instancePath) + "': " + chalk_1["default"].inverse(e.message));
                if (i < 3) {
                    var _data = data;
                    try {
                        for (var _b = __values(e.instancePath.slice(1).split("/")), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var part = _c.value;
                            _data = _data[part];
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    console.log(JSON.stringify(_data, null, 2));
                }
            });
        process.exit();
    }
    var sdata;
    try {
        sdata = utils_1.post_process(data);
    }
    catch (err) {
        console.log(err);
        console.log(JSON.stringify(data.value.at(3).value.at(1), null, 2));
        console.log(chalk_1["default"].bgRed.black("Something Went Wrong with post_process"));
        console.log(chalk_1["default"].bgRed.white(filepath));
        // console.log(data);
        process.exit();
    }
    fs_extra_1["default"].writeFileSync(filepath.slice(0, -10) + "_.json", JSON.stringify(Object.fromEntries([[sdata.type, sdata.value]]), null, 2));
}
