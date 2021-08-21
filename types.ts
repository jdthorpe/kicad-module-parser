export type node = n_container | n_primitive | n_array | n_named_value;
export interface n_container {
    type: string;
    value: node[];
}

export interface n_named_value {
    type: string;
    value: n_primitive | n_array;
}

export interface n_primitive {
    type: "string" | "boolean" | "number";
    value: string | boolean;
}

export interface n_array {
    type: "array";
    value: n_primitive[];
}

export type pad_shape =
    | "circle"
    | "rect"
    | "oval"
    | "trapezoid"
    | "roundrect"
    | "custom";

export type pad_type = "thru_hole" | "np_thru_hole" | "smd" | "connect";

export interface size {
    height: number;
    width: number;
}

export interface drill extends size {
    oval?: boolean;
    offset?: { x: number; y: number };
}

export interface fp_generic {
    layers?: string[];
    width?: number;
    tstamp?: string;
    status?: string;
}

export interface fp_arc extends fp_generic {
    type: "fp_arc";
    center: [number, number];
    end: [number, number];
    angle: number;
}
export interface fp_circle extends fp_generic {
    type: "fp_circle";
    center: [number, number];
    end: [number, number];
}
export interface fp_curve extends fp_generic {
    type: "fp_curve";
    start: [number, number];
    control1: [number, number];
    control2: [number, number];
    end: [number, number];
}
export interface fp_line extends fp_generic {
    type: "fp_line";
    start: [number, number];
    end: [number, number];
}
export interface fp_poly extends fp_generic {
    type: "fp_poly";
    points: [number, number][];
}

export type fp_shape = fp_arc | fp_circle | fp_curve | fp_line | fp_poly;

export interface pad extends common_attribures {
    type: "pad";
    id: string;
    pad_type: pad_type;
    shape: pad_shape;
    at: at;
    size: size;
    layers?: string[];
    drill?: drill;
    tstamp?: string;
}

export type TEXT_TYPE = "reference" | "value" | "user";
export interface fp_text {
    text_type: TEXT_TYPE;
    value: string;
    at: at;
    layers?: string[];
    hide?: boolean;
    effects?: text_effects;
}

export interface text_effects {
    font?: {
        size?: number;
        thickness?: number;
        bold: boolean;
        italic: boolean;
    };
    justify?: JUSTIFY[];
    hide?: boolean;
}

export type JUSTIFY = "left" | "right" | "top" | "bottom" | "mirror";

export interface at {
    x: number;
    y: number;
    angle?: number;
}
export interface common_attribures {
    // floats
    solder_mask_margin?: number;
    solder_paste_margin?: number;
    solder_paste_ratio?: number;
    clearance?: number;
    thermal_width?: number;
    thermal_gap?: number;

    // ints
    autoplace_cost90?: number;
    autoplace_cost180?: number;
    zone_connect?: number;
}

export interface kicad_module extends common_attribures {
    attributes?: string[];
    at?: at;
    descr?: string;
    layer?: string[];
    tags?: string[];
    pads: pad[];
    shapes: fp_shape[];
    text: fp_text[];
    name?: string;
    tedit?: string;
    version?: string;
    placed?: boolean;
    locked?: boolean;
    smd?: boolean;
    virtual?: boolean;
}
