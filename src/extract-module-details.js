"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplify_module = exports.parse_module = void 0;
const module_parser_1 = require("./module-parser");
const utils_1 = require("./utils");
function parse_module(x) {
    const NODE = module_parser_1.parse(x, { startRule: "module" });
    return simplify_module(NODE);
}
exports.parse_module = parse_module;
function simplify_module(NODE) {
    const module_data = {
        pads: [],
        text: [],
        shapes: [],
    };
    const value = NODE.value;
    if (!(value instanceof Array))
        throw "unexpected module value type";
    for (const part of value) {
        switch (part.type) {
            case "module_attribute":
                if (part.value.value === "smd") {
                    module_data.smd = true;
                    break;
                }
                if (part.value.value === "virtual") {
                    module_data.virtual = true;
                    break;
                }
                console.log(`Unandled module attribute value: ${part.value}`);
                break;
            case "layer":
                module_data.layer = utils_1.reduce_strings(part.value);
                break;
            case "tags":
                if (part.value.type == "array") {
                    module_data.tags = utils_1.reduce_strings(part.value.value);
                    break;
                }
                if (part.value.type == "string") {
                    module_data.tags = part.value.value.split(" ");
                    break;
                }
                console.log(`Unandled tags value: ${part.value.type}`);
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
                module_data.at = utils_1.combine(part.value);
                break;
            case "pad":
                module_data.pads.push(process_pad(part));
                break;
            case "name":
            case "descr":
            case "tedit":
            case "version":
                module_data[part.type] = part.value.value;
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
                module_data[part.type] = parseFloat(part.value.value);
                break;
            // ints
            case "autoplace_cost90":
            case "autoplace_cost180":
            case "zone_connect":
                module_data[part.type] = parseInt(part.value.value);
                break;
            default:
                console.log("unhandled part: " + JSON.stringify(part));
        }
    }
    return module_data;
}
exports.simplify_module = simplify_module;
// --------------------------------------------------
// helpers
// --------------------------------------------------
const process_pad = (pad) => {
    const out = { type: "pad" };
    const attrs = pad.value;
    for (const attr of attrs) {
        switch (attr.type) {
            case "pad_id":
                out.id = attr.value.value;
                break;
            case "pad_type":
                out.pad_type = attr.value;
                break;
            case "size":
                out.size = utils_1.combine(attr.value);
                break;
            case "pad_shape":
                out.shape = attr.value;
                break;
            case "drill":
                out.drill = utils_1.combine(attr.value);
                if (out.drill.offset) {
                    out.drill.offset = utils_1.combine(out.drill.offset);
                }
                break;
            case "rect_delta":
            case "at":
                // out.at = (attr.value as node[]).reduce((attr:node,val:any)=>{ val[attr.type] = attr.value ; return val}, {})
                out[attr.type] = utils_1.combine(attr.value);
                break;
            case "layer":
            case "layers":
                out.layers = utils_1.reduce_strings(attr.value);
                break;
            // floats
            case "chamfer_ratio":
            case "roundrect_rratio":
            case "die_length":
            case "solder_mask_margin":
            case "solder_paste_margin":
            case "solder_paste_ratio":
            case "clearance":
            case "thermal_width":
            case "thermal_gap":
                out[attr.type] = parseFloat(attr.value.value);
                break;
            // ints
            case "autoplace_cost90":
            case "autoplace_cost180":
            case "zone_connect":
                out[attr.type] = parseInt(attr.value.value);
                break;
            case "tstamp":
            case "locked":
                out[attr.type] = attr.value;
                break;
            default:
                console.log("unhandled pad attribute: ", attr.type);
                process.exit();
        }
    }
    return out;
};
// (fp_line (start 6.35 -6.35) (end 6.35 6.35) (layer Cmts.User) (width 0.1524))
const process_fp_shape = (shape) => {
    const out = { type: shape.type };
    const attrs = shape.value;
    for (const attr of attrs) {
        switch (attr.type) {
            case "center":
            case "start":
            case "end":
                out[attr.type] = utils_1.reduce_numbers(attr.value);
                break;
            case "angle":
                out[attr.type] = parseFloat(attr.value.value);
                break;
            case "pts":
                out["points"] = attr.value.map((x) => {
                    if (x.type !== "xy") {
                        throw new Error("invalid polygon point type: " + x.type);
                    }
                    return utils_1.reduce_numbers(x.value);
                });
                break;
            case "curve_points":
                Object.assign(utils_1.combine(attr.value), out);
                break;
            // generics
            case "layer":
                out.layers = utils_1.reduce_strings(attr.value);
                break;
            case "width":
            case "tstamp":
            case "status":
                out[attr.type] = attr.value.value;
                break;
            default:
                console.log("unhandled shape attribute: ", attr);
        }
    }
    return out;
};
// (fp_line (start 6.35 -6.35) (end 6.35 6.35) (layer Cmts.User) (width 0.1524))
const process_fp_text_effects = (text) => {
    const out = {};
    const attrs = text.value;
    for (const attr of attrs) {
        switch (attr.type) {
            case "font":
                let font = utils_1.combine(attr.value);
                if ("size" in font)
                    font.size = utils_1.combine(font.size);
                out.font = font;
                break;
            case "justify":
                out.justify = utils_1.reduce_strings(attr.value);
                break;
            case "hide":
                out.hide = true;
                break;
        }
    }
    return out;
};
const process_fp_text = (text) => {
    const out = { type: text.type };
    const attrs = text.value;
    for (const attr of attrs) {
        switch (attr.type) {
            case "text_type":
                out.text_type = attr.value.value;
                break;
            case "value":
                out.value = attr.value.value;
                break;
            case "at":
                out.at = utils_1.combine(attr.value);
                break;
            case "hide":
                out.hide = true;
                break;
            case "layer":
                out.layers = utils_1.reduce_strings(attr.value);
                break;
            case "effects":
                out.effects = process_fp_text_effects(attr);
                break;
            default:
                console.log("unhandled text attribute: ", attr);
        }
    }
    return out;
};
