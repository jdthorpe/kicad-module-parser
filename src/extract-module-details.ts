import { parse } from "../module-parser";
import {
    kicad_module,
    node,
    pad,
    fp_shape,
    text_effects,
    JUSTIFY,
    fp_text,
    TEXT_TYPE,
} from "../types";

export function parse_module(x: string): kicad_module {
    const module_data: kicad_module = {
        pads: [],
        text: [],
        shapes: [],
    };

    const NODE: node = parse(x);

    for (const part of NODE.value as node[]) {
        switch (part.type) {
            case "module_attribute":
                if ((part.value as node).value === "smd") {
                    module_data.smd = true;
                    break;
                }
                if ((part.value as node).value === "virtual") {
                    module_data.virtual = true;
                    break;
                }
                console.log(`Unandled module attribute value: ${part.value}`);
                break;
            case "layer":
                module_data.layer = reduce_strings(part.value as node[]);
                break;
            case "tags":
                if ((part.value as node).type == "array") {
                    module_data.tags = reduce_strings(
                        (part.value as node).value as node[]
                    );
                    break;
                }
                if ((part.value as node).type == "string") {
                    module_data.tags = ((part.value as node)
                        .value as string).split(" ");
                    break;
                }
                console.log(
                    `Unandled tags value: ${(part.value as node).type}`
                );
                console.log(part.value);
                break;
            case "fp_arc":
            case "fp_circle":
            case "fp_curve":
            case "fp_line":
            case "fp_poly":
                module_data.shapes.push(process_fp_shape(part));
                break;
            case "fp_text":
                module_data.text.push(process_fp_text(part));
                break;
            case "at":
                module_data.at = combine(part.value as node[]);
                break;
            case "pad":
                module_data.pads.push(process_pad(part));
                break;
            case "name":
            case "descr":
            case "tedit":
            case "version":
                module_data[part.type] = (part.value as node).value as string;
                break;
            case "locked":
            case "placed":
                module_data[part.type] = true;
                break;

            // floats
            case "solder_mask_margin":
            case "solder_paste_margin":
            case "solder_paste_ratio":
            case "clearance":
            case "thermal_width":
            case "thermal_gap":
                module_data[part.type] = parseFloat(
                    (part.value as node).value as string
                );
                break;

            // ints
            case "autoplace_cost90":
            case "autoplace_cost180":
            case "zone_connect":
                module_data[part.type] = parseInt(
                    (part.value as node).value as string
                );
                break;

            default:
                console.log("unhandled part: " + part.type);
        }
    }
    return module_data;
}

// --------------------------------------------------
// helpers
// --------------------------------------------------

const process_pad = (pad: node): pad => {
    const out: any = { type: "pad" };
    const attrs: node[] = pad.value as node[];

    for (const attr of attrs) {
        switch (attr.type) {
            case "pad_id":
                out.id = (attr.value as node).value;
                break;
            case "pad_type":
                out.pad_type = attr.value;
                break;
            case "size":
                out.size = combine(attr.value as node[]);
                break;
            case "pad_shape":
                out.shape = attr.value;
                break;
            case "drill":
                out.drill = combine(attr.value as node[]);
                console.log("drill value: ", out.drill);
                if (out.drill.offset) {
                    out.drill.offset = combine(out.drill.offset);
                }
                break;
            case "at":
                // out.at = (attr.value as node[]).reduce((attr:node,val:any)=>{ val[attr.type] = attr.value ; return val}, {})
                out.at = combine(attr.value as node[]);
                break;
            case "layer":
            case "layers":
                out.layers = reduce_strings(attr.value as node[]);
                break;

            // floats
            case "solder_mask_margin":
            case "solder_paste_margin":
            case "solder_paste_ratio":
            case "clearance":
            case "thermal_width":
            case "thermal_gap":
                out[attr.type] = parseFloat(
                    (attr.value as node).value as string
                );
                break;

            // ints
            case "autoplace_cost90":
            case "autoplace_cost180":
            case "zone_connect":
                out[attr.type] = parseInt((attr.value as node).value as string);
                break;

            default:
                console.log("unhandled pad attribute: ", attr.type);
        }
    }

    return out;
};

// (fp_line (start 6.35 -6.35) (end 6.35 6.35) (layer Cmts.User) (width 0.1524))
const process_fp_shape = (shape: node): fp_shape => {
    const out: any = { type: shape.type };
    const attrs: node[] = shape.value as node[];

    for (const attr of attrs) {
        switch (attr.type) {
            case "center":
            case "start":
            case "end":
            case "angle":
                out[attr.type] = reduce_numbers(attr.value as node[]);
                break;
            case "pts":
                out["points"] = (attr.value as node[]).map((x) => {
                    if (x.type !== "xy") {
                        throw new Error(
                            "invalid polygon point type: " + x.type
                        );
                    }
                    return reduce_numbers(x.value as node[]);
                });
                break;
            case "curve_points":
                Object.assign(combine(attr.value as node[]), out);
                break;
            /// generics
            case "layer":
                out.layers = reduce_strings(attr.value as node[]);
                break;
            case "width":
                out.width = (attr.value as node).value;
                break;
            case "tstamp":
                out.tstamp = (attr.value as node).value;
                break;
            case "status":
                out.status = (attr.value as node).value;
                break;
            default:
                console.log("unhandled fp attribute: ", attr.type);
        }
    }
    return out as fp_shape;
};

// (fp_line (start 6.35 -6.35) (end 6.35 6.35) (layer Cmts.User) (width 0.1524))
const process_fp_text_effects = (text: node): text_effects => {
    const out: text_effects = {};
    const attrs: node[] = text.value as node[];

    for (const attr of attrs) {
        switch (attr.type) {
            case "font":
                let font = combine(attr.value as node[]);
                if ("size" in font) font.size = combine(font.size);
                out.font = font;
                break;
            case "justify":
                out.justify = reduce_strings(attr.value as node[]) as JUSTIFY[];
                break;
            case "hide":
                out.hide = true;
                break;
        }
    }
    return out;
};

const process_fp_text = (text: node): fp_text => {
    const out: any = { type: text.type };
    const attrs: node[] = text.value as node[];

    for (const attr of attrs) {
        switch (attr.type) {
            case "text_type":
                out.text_type = (attr.value as node).value as TEXT_TYPE;
                break;
            case "value":
                out.value = (attr.value as node).value as string;
                break;
            case "at":
                out.at = combine(attr.value as node[]);
                break;
            case "hide":
                out.hide = true;
                break;
            case "layer":
                out.layers = reduce_strings(attr.value as node[]);
                break;
            case "effects":
                out.effects = process_fp_text_effects(attr);
                break;
            default:
                console.log("unhandled fp attribute: ", attr);
        }
    }

    return out as fp_text;
};

//--------------------------------------------------
// utility functions
//--------------------------------------------------

/*
combine([
    { type:'a', value:1 },
    { type:'b', value:2 },
    { type:'c', value:3 },
]) -> {'a':1, 'b':2, 'c':3}
*/

const combine = (x: node[]): any => {
    const out: any = {};

    for (let attr of x) {
        let val = attr.value;
        if (!attr.value) {
            out[attr.type] = true;
            continue;
        }
        if (typeof val === "string") {
            out[attr.type] = attr.value;
        } else {
            if (val instanceof Array) {
                out[attr.type] = attr.value;
            } else if (val.type === "string") {
                out[attr.type] = (attr.value as node).value!;
            } else if (val.type === "number") {
                out[attr.type] = parseFloat(
                    (attr.value as node).value! as string
                );
            } else {
                out[attr.type] = attr.value;
            }
        }
    }
    return out;
};

/*
reduce_strings([
    { type:'string', value:'A' },
    { type:'string', value:'B' },
    { type:'string', value:'C' },
]) -> ["A","B","C"]
*/

const reduce_strings = (x: node[]) => x.map((y) => y.value as string);

/*
reduce_numbers([
    { type:'string', value:'1.1' },
    { type:'string', value:'2.2' },
    { type:'string', value:'3.3' },
]) -> ["1.1","2.2","3.3"]
*/
const reduce_numbers = (x: node[]) =>
    x.map((y) => parseFloat(y.value as string));
