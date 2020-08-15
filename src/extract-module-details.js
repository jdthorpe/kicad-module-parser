"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var module_parser_1 = require("../module-parser");
function parse_module(x) {
    var module_data = {
        pads: [],
        text: [],
        shapes: [],
    };
    var NODE = module_parser_1.parse(x);
    for (var _i = 0, _a = NODE.value; _i < _a.length; _i++) {
        var part = _a[_i];
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
                console.log("Unandled module attribute value: " + part.value);
                break;
            case "layer":
                module_data.layer = reduce_strings(part.value);
                break;
            case "tags":
                if (part.value.type == "array") {
                    module_data.tags = reduce_strings(part.value.value);
                    break;
                }
                if (part.value.type == "string") {
                    module_data.tags = part.value
                        .value.split(" ");
                    break;
                }
                console.log("Unandled tags value: " + part.value.type);
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
                module_data.at = combine(part.value);
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
                console.log("unhandled part: " + part.type);
        }
    }
    return module_data;
}
exports.parse_module = parse_module;
// --------------------------------------------------
// helpers
// --------------------------------------------------
var process_pad = function (pad) {
    var out = { type: "pad" };
    var attrs = pad.value;
    for (var _i = 0, attrs_1 = attrs; _i < attrs_1.length; _i++) {
        var attr = attrs_1[_i];
        switch (attr.type) {
            case "pad_id":
                out.id = attr.value;
                break;
            case "pad_type":
                out.pad_type = attr.value;
                break;
            case "size":
                out.size = combine(attr.value);
                break;
            case "pad_shape":
                out.shape = attr.value;
                break;
            case "drill":
                out.drill = out.drill
                    ? __spreadArrays(out.drill, [attr.value]) : [attr.value];
                break;
            case "at":
                // out.at = (attr.value as node[]).reduce((attr:node,val:any)=>{ val[attr.type] = attr.value ; return val}, {})
                out.at = combine(attr.value);
                break;
            case "layer":
            case "layers":
                out.layers = reduce_strings(attr.value);
                break;
            // floats
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
            default:
                console.log("unhandled pad attribute: ", attr.type);
        }
    }
    return out;
};
// (fp_line (start 6.35 -6.35) (end 6.35 6.35) (layer Cmts.User) (width 0.1524))
var process_fp_shape = function (shape) {
    var out = { type: shape.type };
    var attrs = shape.value;
    for (var _i = 0, attrs_2 = attrs; _i < attrs_2.length; _i++) {
        var attr = attrs_2[_i];
        switch (attr.type) {
            case "center":
            case "start":
            case "end":
            case "angle":
                out[attr.type] = reduce_numbers(attr.value);
                break;
            case "pts":
                out["points"] = attr.value.map(function (x) {
                    if (x.type !== "xy") {
                        throw new Error("invalid polygon point type: " + x.type);
                    }
                    return reduce_numbers(x.value);
                });
                break;
            case "curve_points":
                Object.assign(combine(attr.value), out);
                break;
            /// generics
            case "layer":
                out.layers = reduce_strings(attr.value);
                break;
            case "width":
                out.width = attr.value.value;
                break;
            case "tstamp":
                out.tstamp = attr.value.value;
                break;
            case "status":
                out.status = attr.value.value;
                break;
            default:
                console.log("unhandled fp attribute: ", attr.type);
        }
    }
    return out;
};
// (fp_line (start 6.35 -6.35) (end 6.35 6.35) (layer Cmts.User) (width 0.1524))
var process_fp_text_effects = function (text) {
    var out = {};
    var attrs = text.value;
    for (var _i = 0, attrs_3 = attrs; _i < attrs_3.length; _i++) {
        var attr = attrs_3[_i];
        switch (attr.type) {
            case "font":
                var font = combine(attr.value);
                if ("size" in font)
                    font.size = combine(font.size);
                out.font = font;
            case "justify":
                out.justify = reduce_strings(attr.value);
            case "hide":
                out.hide = true;
        }
    }
    return out;
};
var process_fp_text = function (text) {
    var out = { type: text.type };
    var attrs = text.value;
    for (var _i = 0, attrs_4 = attrs; _i < attrs_4.length; _i++) {
        var attr = attrs_4[_i];
        switch (attr.type) {
            case "text_type":
                out.text_type = attr.value.value;
                break;
            case "value":
                out.value = attr.value.value;
                break;
            case "at":
                out.at = combine(attr.value);
                break;
            case "hide":
                out.hide = true;
                break;
            case "layer":
                out.layers = reduce_strings(attr.value);
                break;
            case "effects":
                out.effects = process_fp_text_effects(attr);
                break;
            default:
                console.log("unhandled fp attribute: ", attr);
        }
    }
    return out;
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
var combine = function (x) {
    var out = {};
    for (var _i = 0, x_1 = x; _i < x_1.length; _i++) {
        var attr = x_1[_i];
        var val = attr.value;
        if (!attr.value) {
            out[attr.type] = true;
            continue;
        }
        if (typeof val === "string") {
            out[attr.type] = attr.value;
        }
        else {
            if (val instanceof Array) {
                out[attr.type] = attr.value;
            }
            else if (["string", "number", "number"].indexOf(val.type) !== -1) {
                out[attr.type] = attr.value.value;
            }
            else {
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
var reduce_strings = function (x) { return x.map(function (y) { return y.value; }); };
/*
reduce_numbers([
    { type:'string', value:'1.1' },
    { type:'string', value:'2.2' },
    { type:'string', value:'3.3' },
]) -> ["1.1","2.2","3.3"]
*/
var reduce_numbers = function (x) {
    return x.map(function (y) { return parseFloat(y.value); });
};
