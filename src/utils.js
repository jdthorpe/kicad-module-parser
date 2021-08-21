"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduce_numbers = exports.reduce_strings = exports.post_process = void 0;
const verbose = false;
/*
combine([
    { type:'a', value:1 },
    { type:'b', value:2 },
    { type:'c', value:3 },
]) -> {'a':1, 'b':2, 'c':3}
*/
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
            return x.value.map((x) => x.type === "number" ? parseFloat(x.value) : x.value);
        default:
            if (x.type === "at") {
                console.log(x);
                process.exit();
            }
            return {
                type: x.type,
                value: simplify_primitive(x.value),
            };
        // throw `Unexpected type "${x.type}"`;
    }
}
const itype = "pcb_text_width";
const post_process = (x) => {
    // depth first transformation
    let current = x;
    let next;
    let values = [];
    let i = 0;
    let SI;
    const stack = [];
    while (true) {
        verbose &&
            console.log("> " +
                stack.map((x) => `${x[0].type}[${x[1]}]`).join("/") +
                `/${current.type}[${i}]`);
        if (i >= current.value.length) {
            let out = _process(values, current.type, stack);
            let SI = stack.pop();
            if (typeof SI === "undefined") {
                verbose &&
                    console.log("post_process returning", JSON.stringify(out, null, 2));
                return out;
            }
            [current, i, values] = SI;
            if (current.type === itype) {
                console.log(`return to ${current.type} ${i} with value:`, out);
                console.log("from", current.value[i], "\n======");
            }
            values.push(out);
            i++;
            continue;
        }
        next = current.value[i];
        verbose && console.log("curent", current);
        verbose && console.log("next", next);
        if (current.type === itype) {
            console.log(`${current.type} i: `, i, next, "\n======");
        }
        if (Array.isArray(next.value)) {
            if (current.type === itype) {
                console.log("recurse\n>>>");
            }
            // recurse
            SI = [current, i, values];
            stack.push(SI);
            current = next;
            verbose && console.log("recurse\n>>>");
            i = 0;
            values = [];
        }
        else {
            if (current.type === itype) {
                console.log(`${current.type} push: `, i, next, "\n>>>");
            }
            // if(current.type === "thickness") process.exit(1)
            values.push(simplify_primitive(next));
            i++;
        }
        // The current element of the array is a simple element
        // the current element is a simpleton
        // e.g. {'pad_type': {string:"np_throu_hole"}}
    }
    throw "never";
};
exports.post_process = post_process;
const assert = (x, message) => {
    if (!x)
        throw message;
};
const has_dups = [];
function _process(values, type, stack) {
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
    }
    // standard processing
    switch (type) {
        case "kicad_pcb":
            return {
                type,
                value: gather_all(values, [
                    "version",
                    "general",
                    "page info",
                    "page",
                    "paper",
                    "title_block",
                    "setup",
                    "layers",
                ]),
            };
        case "module":
            return {
                type,
                value: gather_all(values, [
                    "name",
                    "layer",
                    "tedit",
                    "tstamp",
                    "at",
                    "descr",
                    "tags",
                ]),
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
            if (values.every((x) => typeof x === "object" && "type" in x))
                return { type, value: values.map((x) => x.value) };
            return { type, value: values };
        case "pts":
            return { type, value: values.map((x) => x.value) };
            // case "center": // TODO: formerly an array of length 2
            // case "start": // TODO: formerly an array of length 2
            // case "end": // TODO: formerly an array of length 2
            // case "mid": // TODO: formerly an array of length 2
            // case "xy": // TODO: formerly an array of length 2
            //     assert(
            //         values.length === 2,
            //         `${type} should have 2 values but got ${JSON.stringify(
            //             values,
            //             null,
            //             2
            //         )} at ${stack.map((x) => `${x[0].type}[${x[1]}]`).join("/")}`
            //     );
            //     // console.log("xy", { x: values[0], y: values[1] })
            //     return { x: values[0], y: values[1] };
            // case "xyz":
            //     assert(values.length === 3, `${type} should have 3 values`);
            //     return { x: values[0], y: values[1], z: values[2] };
            GATHER: ;
        default:
            if (!values.every((x) => typeof x.type !== "undefined")) {
                console.log(values);
                throw (`Invalid values array ${stack
                    .map((x) => `${x[0].type}[${x[1]}]`)
                    .join("/")}/` + type);
            }
            const ukeys = new Set(values.map((x) => x.type));
            if (has_dups.indexOf(type) === -1 && ukeys.size < values.length) {
                const tallies = {};
                for (let v of values) {
                    tallies[v.type] = (tallies[v.type] || 0) + 1;
                }
                console.log("duplicate keys: " +
                    Object.entries(tallies)
                        .filter((x) => x[1] > 1)
                        .map((x) => `${x[0]}(${x[1]})`)
                        .join(", "));
                console.log(values);
                throw (`Duplicate Keys in ${stack
                    .map((x) => `${x[0].type}[${x[1]}]`)
                    .join("/")}/` + type);
            }
            if (!values.map((x) => typeof x.type !== "undefined"))
                console.log();
            if (type === itype) {
                console.log("values: ", values);
                console.log(values.map((x) => typeof x.type !== "undefined"));
                console.log(values.map((x) => [x.type, x.value]));
                console.log(JSON.stringify(Object.fromEntries(values.map((x) => [x.type, x.value]))));
                console.log("bye");
                process.exit();
            }
            return {
                type: type,
                value: Object.fromEntries(values.map((x) => [x.type, x.value])),
            };
    }
}
// export const combine = (x: (n_primitive | n_container | n_array)[]): any => {
//     const out: any = {};
//
//     for (let attr of x) {
//         let val = attr.value;
//         if (val instanceof Array) {
//             out[attr.type] = attr.value;
//         } else if (val.type === "string") {
//             out[attr.type] = (attr.value as node).value!;
//         } else if (val.type === "number") {
//             out[attr.type] = parseFloat((attr.value as node).value! as string);
//         } else {
//             out[attr.type] = attr.value;
//         }
//     }
//
//     return out;
// };
/*
reduce_strings([
    { type:'string', value:'A' },
    { type:'string', value:'B' },
    { type:'string', value:'C' },
]) -> ["A","B","C"]
*/
const reduce_strings = (x) => x.map((y) => y.value);
exports.reduce_strings = reduce_strings;
/*
reduce_numbers([
    { type:'string', value:'1.1' },
    { type:'string', value:'2.2' },
    { type:'string', value:'3.3' },
]) -> ["1.1","2.2","3.3"]
*/
const reduce_numbers = (x) => x.map((y) => parseFloat(y.value));
exports.reduce_numbers = reduce_numbers;
function gather(values, key) {
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
    for (let [i, x] of values.entries()) {
        if (x.type === key)
            indexes.unshift(i);
    }
    // nothing to do
    if (!indexes.length)
        return;
    // splice out the old vals
    const vals = [];
    for (let indx of indexes) {
        vals.unshift(values.splice(indx, 1)[0].value);
    }
    // insert the new values array
    values.splice(indexes[indexes.length - 1], 0, { type: key, value: vals });
}
function gather_all(values, singletons) {
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
    const out = {};
    for (let x of values) {
        if (typeof x.type === "undefined") {
            console.log(x);
            throw "problem";
        }
        if (singletons.indexOf(x.type) !== -1) {
            if (x.type in out)
                throw `Duplicate values encountered for singleton '${x.type}'`;
            out[x.type] = x.value;
        }
        else {
            if (!(x.type in out))
                out[x.type] = [];
            out[x.type].push(x.value);
        }
    }
    return out;
}
