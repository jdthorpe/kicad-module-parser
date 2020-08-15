import through2 from "through2";
import { parse } from "./module-parser";
import fse from "fs-extra";
import walk from "klaw";

// const mod = fse.readFileSync( "/Users/jasonthorpe/kb/kicad-module-parser/data/kicad-footprints/Connector_Samtec_HLE_SMD.pretty/Samtec_HLE-133-02-xxx-DV-LC_2x33_P2.54mm_Horizontal.kicad_mod" );
// https://github.com/Digi-Key/digikey-kicad-library.git
// https://github.com/KiCad/kicad-footprints.git

walk("./data")
    .pipe(
        through2.obj(function (item, enc, next) {
            if (!item.stats.isDirectory() && item.path.endsWith(".kicad_mod"))
                this.push(item);
            next();
        })
    )
    .on("data", (item) => {
        const mod: string = fse.readFileSync(item.path).toString();
        try {
            parse(mod);
        } catch (err) {
            console.log(err);
            console.log(`falied to parse module ${item.path}`);
            process.exit();
        }
    });
