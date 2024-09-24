import through2 from "through2";
import { parse } from "../src/module-parser";
import fse from "fs-extra";
import walk from "klaw";
import path from "path";
import yaml from "js-yaml";
import chalk from "chalk";
import Ajv from "ajv";
import { post_process } from "../src/utils";

// ---------------
// constants
// ---------------

const AJV = new Ajv({ strict: false });

const schema: any = yaml.load(
    fse.readFileSync(path.join(__dirname, "sexp_schema.yaml"), "utf-8")
);

// ---------------
// export
// ---------------
let resolver: { (value?: Promise<any>): void };
const Done = new Promise((resolve) => (resolver = resolve));
export default Done;

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
walk(path.join(__dirname, "..", "data"))
    .pipe(
        through2.obj(function (item, enc, next) {
            if (!item.stats.isDirectory() && item.path.endsWith(".kicad_mod"))
                this.push(item);
            next();
        })
    )
    .on("data", (item) => process_file(item.path))
    .on("end", () => resolver());

// --------------------------------------------------
// process all the files in the data directory
// --------------------------------------------------
function process_file(filepath: string) {
    const mod: string = fse.readFileSync(filepath).toString();
    let data: any;
    try {
        data = parse(mod, { startRule: "module" });
        fse.writeFileSync(
            filepath.slice(0, -10) + ".json",
            JSON.stringify(data, null, 2)
        );
    } catch (err) {
        console.log(err);
        console.log(`failed to parse module ${filepath}`);
        process.exit();
    }

    let data_is_valid = true;
    try {
        data_is_valid = AJV.validate(schema, data) as boolean;
    } catch (err) {
        console.log(chalk.bgRed.black("Something Went Wrong"));
        console.log("Error:", (err as Error).message);

        AJV.errors &&
            AJV.errors.map((e) =>
                console.log(
                    `${chalk.bgGreen((e as any).dataPath)}: ${chalk.inverse(
                        e.message
                    )}`
                )
            );
        return;
    }

    if (!data_is_valid) {
        console.log(
            chalk.black.bgRed("Data does not follow the schema"),
            filepath
        );
        AJV.errors &&
            AJV.errors.map((e, i) => {
                console.log(
                    `'${chalk.bgBlue(e.instancePath)}': ${chalk.inverse(
                        e.message
                    )}`
                );
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
        sdata = post_process(data);
    } catch (err) {
        console.log(
            chalk.bgRed.black("Something Went Wrong with post_process")
        );
        console.log(chalk.bgRed.white(filepath));
        console.log(data);
        process.exit();
    }
    fse.writeFileSync(
        filepath.slice(0, -10) + "_.json",
        JSON.stringify(Object.fromEntries([[sdata.type, sdata.value]]), null, 2)
    );
}
