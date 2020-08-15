import fse from "fs-extra";

const mod = fse
    .readFileSync(
        //"/Users/jasonthorpe/kb/kicad-module-parser/data/Keebio-parts.pretty/Triple-Dual-1u-LED-flip.kicad_mod"
        // "/Users/jasonthorpe/kb/kicad-module-parser/data/Keebio-parts.pretty/TRRS-PJ-320A.kicad_mod"
        "/Users/jasonthorpe/kb/kicad-footprints/Jumper.pretty/SolderJumper-3_P1.3mm_Bridged2Bar12_Pad1.0x1.5mm_NumberLabels.kicad_mod"
    )
    .toString();

// (mf.value as node[]).map((x: node) => {
//     x.type in workers ? workers[x.type](x) : undefined;
// });

//console.log(module_data.pad.map((x) => x.shape));
// console.log(module_data.shapes[0]);
// console.log(module_data.pads[0]);
//console.log(module_data);
