interface node {
    type: string;
    value: node | node[] | string;
}

type pad_shape =
    | "circle"
    | "rect"
    | "oval"
    | "trapezoid"
    | "roundrect"
    | "custom";
type pad_type = "thru_hole" | "np_thru_hole" | "smd" | "connect";

interface size {
    height: string;
    width: string;
}

interface drill extends size {
    oval?: boolean;
    offset?: number;
}

interface fp_generic {
    layer?: string[];
    width?: number;
    tstamp?: string;
    status?: string;
}

export interface fp_arc extends fp_generic {
    type: "fp_arc";
    center: [number, number];
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

type fp_shape = fp_arc | fp_circle | fp_curve | fp_line | fp_poly;

interface pad extends common_attribures {
    type: "pad";
    id: string;
    pad_type: pad_type;
    shape: pad_shape;
    at: at;
    layers?: string[];
    drill?: drill[];
    tstamp?: string;
}

type TEXT_TYPE = "reference" | "value" | "user";
interface fp_text {
    text_type: TEXT_TYPE;
    value: string;
    at: at;
    layer?: string[];
    hide?: boolean;
    effects?: text_effects;
}

interface text_effects {
    font?: {
        size?: number;
        thickness?: number;
        bold: boolean;
        italic: boolean;
    };
    justify?: JUSTIFY[];
    hide?: boolean;
}

type JUSTIFY = "left" | "right" | "top" | "bottom" | "mirror";

interface at {
    x: number;
    y: number;
    angle?: number;
}
interface common_attribures {
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

interface kicad_module extends common_attribures {
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
