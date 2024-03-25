"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
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
exports.__esModule = true;
exports.post_process = void 0;
var verbose = false;
function simplify_primitive(x) {
    verbose && console.log("simplify_primitive: ", x);
    switch (x.type) {
        case "string":
        case "hex":
        case "boolean":
            return x.value;
        case "number":
            return parseFloat(x.value);
        case "array":
            return x.value.map(function (x) {
                return x.type === "number" ? parseFloat(x.value) : x.value;
            });
        default:
            if (x.type === "at") {
                console.log(x);
                process.exit();
            }
            return {
                type: x.type,
                value: simplify_primitive(x.value)
            };
        // throw `Unexpected type "${x.type}"`;
    }
}
// const itype = "pcb_text_width";
var post_process = function (x, long) {
    // depth first transformation
    var _a;
    if (long === void 0) { long = true; }
    var current = x;
    var next;
    var values = [];
    var i = 0;
    var SI;
    var stack = [];
    while (true) {
        verbose &&
            console.log("> " +
                stack.map(function (x) { return x[0].type + "[" + x[1] + "]"; }).join("/") +
                ("/" + current.type + "[" + i + "]"));
        if (i >= current.value.length) {
            var out = void 0;
            if (long &&
                (current.type === "kicad_pcb" || current.type === "module" || current.type === "kicad_symbol_lib")) {
                out = { type: current.type, value: values };
            }
            else {
                out = _process(values, current.type, stack);
            }
            var SI_1 = stack.pop();
            if (typeof SI_1 === "undefined") {
                verbose &&
                    console.log("post_process returning", JSON.stringify(out, null, 2));
                return out;
            }
            _a = __read(SI_1, 3), current = _a[0], i = _a[1], values = _a[2];
            /* inspect:
            if (current.type === itype) {
                console.log(`return to ${current.type} ${i} with value:`, out);
                console.log("from", current.value[i], "\n======");
            } */
            values.push(out);
            i++;
            continue;
        }
        next = current.value[i];
        verbose && console.log("curent", current);
        verbose && console.log("next", next);
        /* inspect:
        if (current.type === itype)
            console.log(`${current.type} i: `, i, next, "\n======");
            */
        if (Array.isArray(next.value)) {
            /* inspect:
            if (current.type === itype) console.log("recurse\n>>>");
            */
            // recurse
            SI = [current, i, values];
            stack.push(SI);
            current = next;
            verbose && console.log("recurse\n>>>");
            i = 0;
            values = [];
        }
        else {
            // inspect: if (current.type === itype) console.log(`${current.type} push: `, i, next, "\n>>>");
            values.push(simplify_primitive(next));
            i++;
        }
    }
};
exports.post_process = post_process;
var has_dups = [];
function _process(values, type, stack) {
    var e_1, _a;
    verbose && console.log(">> _process:", values, type);
    // pre_process (gathering valid duplicate keys)
    switch (type) {
        case "setup":
            gather(values, "user_trace_width");
            gather(values, "user_via");
            break;
        case "zone":
            gather(values, "filled_polygon");
            gather(values, "polygon");
            break;
        case "fill_segments":
            gather(values, "pts");
            break;
        case "net_class":
            gather(values, "add_net");
            break;
        case "kicad_symbol_lib":
            gather(values, "symbol");
            break;
        case "symbol":
            gather(values, "symbol");
            gather(values, "pin");
            gather(values, "property");
            gather(values, "arc");
            gather(values, "circle");
            gather(values, "polyline");
            gather(values, "rectangle");
            gather(values, "text");
            break;
        case "pin":
            gather(values, "alternate");
            break;
    }
    // standard processing
    switch (type) {
        case "kicad_pcb":
            return {
                type: type,
                value: gather_all(values, [
                    "version",
                    "general",
                    "page info",
                    "page",
                    "paper",
                    "host",
                    "title_block",
                    "setup",
                    "layers",
                ])
            };
        case "module":
            return {
                type: type,
                value: gather_all(values, [
                    "name",
                    "layer",
                    "tedit",
                    "tstamp",
                    "at",
                    "descr",
                    "tags",
                ])
            };
        case "kicad_symbol_lib":
            return {
                type: type,
                value: gather_all(values, [
                    "version",
                    "generator",
                    "generator_version",
                ])
            };
        case "area":
        case "layers":
        // setup options:
        case "user_via":
        case "user_diff_pair":
        case "pcb_text_size":
        case "mod_text_size":
        case "pad_size":
        case "aux_axis_origin":
        case "grid_origin":
        // pad
        case "primitives":
        case "justify":
            if (values.every(function (x) { return typeof x === "object" && "type" in x; }))
                return { type: type, value: values.map(function (x) { return x.value; }) };
            return { type: type, value: values };
        case "pts":
            return { type: type, value: values.map(function (x) { return x.value; }) };
        default:
            if (!values.every(function (x) { return typeof x.type !== "undefined"; })) {
                console.error(values);
                throw ("Invalid values array " + stack
                    .map(function (x) { return x[0].type + "[" + x[1] + "]"; })
                    .join("/") + "/" + type);
            }
            var ukeys = new Set(values.map(function (x) { return x.type; }));
            if (has_dups.indexOf(type) === -1 && ukeys.size < values.length) {
                var tallies = {};
                try {
                    for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                        var v = values_1_1.value;
                        tallies[v.type] = (tallies[v.type] || 0) + 1;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (values_1_1 && !values_1_1.done && (_a = values_1["return"])) _a.call(values_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                console.log("duplicate keys: " +
                    Object.entries(tallies)
                        .filter(function (x) { return x[1] > 1; })
                        .map(function (x) { return x[0] + "(" + x[1] + ")"; })
                        .join(", "));
                console.log(values);
                throw ("Duplicate Keys in " + stack
                    .map(function (x) { return x[0].type + "[" + x[1] + "]"; })
                    .join("/") + "/" + type);
            }
            /* inspect:
            if (type === itype) {
                console.log("values: ", values);
                console.log(values.map((x) => typeof x.type !== "undefined"));
                console.log(values.map((x) => [x.type, x.value]));
                console.log(
                    JSON.stringify(
                        Object.fromEntries(values.map((x) => [x.type, x.value]))
                    )
                );
                console.log("bye");
                process.exit();
            }*/
            return {
                type: type,
                value: Object.fromEntries(values.map(function (x) { return [x.type, x.value]; }))
            };
    }
}
function gather(values, key) {
    var e_2, _a, e_3, _b;
    /*
    value = [
        {type:'a', value: 1},
        {type:'b', value: 1},
        {type:'c', value: 1},
        {type:'b', value: 1},
    ]
    key = 'b'

    ... becomes ...

    value = [
        {type:'a', value: 1},
        {type:'b', value: [1, 1]},
        {type:'c', value: 1},
    ]
    */
    // get indexes of matching elelments (in reverse order)
    var indexes = [];
    try {
        for (var _c = __values(values.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
            var _e = __read(_d.value, 2), i = _e[0], x = _e[1];
            if (x.type === key)
                indexes.unshift(i);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_d && !_d.done && (_a = _c["return"])) _a.call(_c);
        }
        finally { if (e_2) throw e_2.error; }
    }
    // nothing to do
    if (!indexes.length)
        return;
    // splice out the old vals
    var vals = [];
    try {
        for (var indexes_1 = __values(indexes), indexes_1_1 = indexes_1.next(); !indexes_1_1.done; indexes_1_1 = indexes_1.next()) {
            var indx = indexes_1_1.value;
            vals.unshift(values.splice(indx, 1)[0].value);
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (indexes_1_1 && !indexes_1_1.done && (_b = indexes_1["return"])) _b.call(indexes_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    // insert the new values array
    values.splice(indexes[indexes.length - 1], 0, { type: key, value: vals });
}
function gather_all(values, singletons) {
    var e_4, _a;
    /*

    NOTE: Modifies `values` in place
    value = [
        {type:'a', value: 1},
        {type:'b', value: 1},
        {type:'c', value: 1},
        {type:'b', value: 1},
    ]
    singletons = 'a'

    ... becomes ...

    value = {
        'a': 1,
        'b': [ 1, 1 ],
        'c': [ 1 ],
    }
    */
    // get indexes of matching elelments (in reverse order)
    var out = {};
    try {
        for (var values_2 = __values(values), values_2_1 = values_2.next(); !values_2_1.done; values_2_1 = values_2.next()) {
            var x = values_2_1.value;
            if (typeof x.type === "undefined") {
                console.log(x);
                throw "problem";
            }
            if (singletons.indexOf(x.type) !== -1) {
                if (x.type in out)
                    throw "Duplicate values encountered for singleton '" + x.type + "'";
                out[x.type] = x.value;
            }
            else {
                if (!(x.type in out))
                    out[x.type] = [];
                out[x.type].push(x.value);
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (values_2_1 && !values_2_1.done && (_a = values_2["return"])) _a.call(values_2);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return out;
}
