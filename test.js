"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var through2_1 = __importDefault(require("through2"));
var module_parser_1 = require("./module-parser");
var fs_extra_1 = __importDefault(require("fs-extra"));
var klaw_1 = __importDefault(require("klaw"));
// const mod = fse.readFileSync( "/Users/jasonthorpe/kb/kicad-module-parser/data/kicad-footprints/Connector_Samtec_HLE_SMD.pretty/Samtec_HLE-133-02-xxx-DV-LC_2x33_P2.54mm_Horizontal.kicad_mod" );
// https://github.com/Digi-Key/digikey-kicad-library.git
// https://github.com/KiCad/kicad-footprints.git
klaw_1.default("./data")
    .pipe(through2_1.default.obj(function (item, enc, next) {
    if (!item.stats.isDirectory() && item.path.endsWith(".kicad_mod"))
        this.push(item);
    next();
}))
    .on("data", function (item) {
    var mod = fs_extra_1.default.readFileSync(item.path).toString();
    try {
        module_parser_1.parse(mod);
    }
    catch (err) {
        console.log(err);
        console.log("falied to parse module " + item.path);
        process.exit();
    }
});
