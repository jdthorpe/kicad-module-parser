//--------------------------------------------------
// utility functions
//--------------------------------------------------
import {
    n_array,
    n_container,
    n_named_value,
    n_primitive,
    node,
} from "../types";

const verbose = false;

function simplify_primitive(x: n_primitive | n_array | n_named_value): any {
    verbose && console.log("simplify_primitive: ", x);

    switch (x.type) {
        case "string":
        case "hex":
        case "boolean":
            return x.value;
        case "number":
            return parseFloat(x.value as string);
        case "array":
            return (x.value as n_primitive[]).map((x) =>
                x.type === "number" ? parseFloat(x.value as string) : x.value
            );
        default:
            if (x.type === "at") {
                console.log(x);
                process.exit();
            }
            return {
                type: x.type,
                value: simplify_primitive((x as n_named_value).value),
            };
        // throw `Unexpected type "${x.type}"`;
    }
}

type stackitem = [
    // current elt in the stack
    n_container,
    // pointer to current child
    number,
    // data from previous children
    any[]
];

// const itype = "pcb_text_width";
export const post_process = (x: n_container, long: boolean = true): any => {
    // depth first transformation

    let current: n_container = x;
    let next: node;
    let values: any[] = [];
    let i: number = 0;
    let SI: stackitem;

    const stack: stackitem[] = [];

    while (true) {
        verbose &&
            console.log(
                "> " +
                    stack.map((x) => `${x[0].type}[${x[1]}]`).join("/") +
                    `/${current.type}[${i}]`
            );

        if (i >= current.value.length) {
            let out;
            if (
                long &&
                (current.type === "kicad_pcb" || current.type === "module" || current.type === "kicad_symbol_lib")
            ) {
                out = { type: current.type, value: values };
            } else {
                out = _process(values, current.type, stack);
            }
            let SI = stack.pop();
            if (typeof SI === "undefined") {
                verbose &&
                    console.log(
                        "post_process returning",
                        JSON.stringify(out, null, 2)
                    );
                return out;
            }
            [current, i, values] = SI;
            /* inspect:
            if (current.type === itype) {
                console.log(`return to ${current.type} ${i} with value:`, out);
                console.log("from", current.value[i], "\n======");
            } */
            values.push(out);
            i++;
            continue;
        }

        next = current.value[i]!;
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
            current = next as n_container;
            verbose && console.log("recurse\n>>>");
            i = 0;
            values = [];
        } else {
            // inspect: if (current.type === itype) console.log(`${current.type} push: `, i, next, "\n>>>");
            values.push(
                simplify_primitive(
                    next as n_primitive | n_named_value | n_array
                )
            );
            i++;
        }
    }
};

const has_dups: string[] = [];

function _process(values: any[], type: string, stack: stackitem[]): any {
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
                type,
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
        case "kicad_symbol_lib":
            return {
                type,
                value: gather_all(values, [
                    "version",
                    "generator",
                    "generator_version",
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
        default:
            if (!values.every((x) => typeof x.type !== "undefined")) {
                console.error(values);
                throw (
                    `Invalid values array ${stack
                        .map((x) => `${x[0].type}[${x[1]}]`)
                        .join("/")}/` + type
                );
            }

            const ukeys = new Set(values.map((x) => x.type));
            if (has_dups.indexOf(type) === -1 && ukeys.size < values.length) {
                const tallies: { [x: string]: number } = {};
                for (let v of values) {
                    tallies[v.type] = (tallies[v.type] || 0) + 1;
                }
                console.log(
                    "duplicate keys: " +
                        Object.entries(tallies)
                            .filter((x) => x[1] > 1)
                            .map((x) => `${x[0]}(${x[1]})`)
                            .join(", ")
                );
                console.log(values);
                throw (
                    `Duplicate Keys in ${stack
                        .map((x) => `${x[0].type}[${x[1]}]`)
                        .join("/")}/` + type
                );
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
                value: Object.fromEntries(values.map((x) => [x.type, x.value])),
            };
    }
}

function gather(values: { type: string; value: any }[], key: string) {
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
    var indexes: number[] = [];
    for (let [i, x] of values.entries()) {
        if (x.type === key) indexes.unshift(i);
    }
    // nothing to do
    if (!indexes.length) return;

    // splice out the old vals
    const vals = [];
    for (let indx of indexes) {
        vals.unshift(values.splice(indx, 1)[0]!.value);
    }
    // insert the new values array
    values.splice(indexes[indexes.length - 1]!, 0, { type: key, value: vals });
}

function gather_all(
    values: { type: string; value: any }[],
    singletons: string[]
) {
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
    const out: { [x: string]: any } = {};

    for (let x of values) {
        if (typeof x.type === "undefined") {
            console.log(x);
            throw "problem";
        }
        if (singletons.indexOf(x.type) !== -1) {
            if (x.type in out)
                throw `Duplicate values encountered for singleton '${x.type}'`;
            out[x.type] = x.value;
        } else {
            if (!(x.type in out)) out[x.type] = [];
            out[x.type].push(x.value);
        }
    }
    return out;
}
