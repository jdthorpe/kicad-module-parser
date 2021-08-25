
board /* parseBOARD_unchecked */
    = "(" _ 
    type: "kicad_pcb" _ 
    header:header _ 
    rest:( val:(
        general /
        paper /
        title_block /
        board_layers /
        setup /
        net /
        net_class /
        gr_arc /
        gr_circle /
        gr_curve /
        gr_line /
        gr_rect /
        gr_poly /
        gr_text /
        dimension /
        module /
        segment /
        arc /
        via /
        zone /
        target ) _ {return val})*  
    ")" _ {
        return {type, value: [...header, ...rest]}
};


// --------------------------------------------------
// headers
// --------------------------------------------------

general /* parseGeneralSection */
 =  "(" _ type:"general" _ 
        options: (general_opt/general_array_opt)*
    ")" {
    return { type,value: options }
 }
 
general_opt
 = ( "(" _ 
        type:("thickness"/"drawings"/"tracks"/"zones"/"modules"/"nets"/"links"/"no_connects"/"area") _ 
        value:number_  
    ")" _ {
        return {type, value}
    })

general_array_opt
 =  "(" _ 
        type:("area") _ 
        value:number_*
    ")" _ {return {type, value}}


paper /* parsePAGE_INFO */
 =  "(" _ 
        ("page"/"paper") _ 
        ((("custom"/"User") _ height:number _ width:number )/symbol) _ 
        portrait:("portrait" _ )?
        ")" {
    return {type: "page info", value: { type:"string", value:"unsupported" }}
 }

title_block /* parseTITLE_BLOCK */
 =  "(" _ 
        type:"title_block" _ 
        options: ( "(" _ $("title" / "date"  / "rev"  / "company" / ("comment" _ [0-8])) _ (string/symbol) _ ")" _) *
    ")" {
    return {type, value: options.map(x => ({ type: x[2],value: x[4]}))}
 }

// --------------------------------------------------
// layers
// --------------------------------------------------

board_layers  /* parseLayers */ 
 =  "(" _ 
        type:"layers" _
        value:( v:_board_layer _ {return v})*  
    ")"{
        return { type, value }
}

_board_layer  /* parseLayer */
 =  "(" _ 
        index:(symbol / number) _ 
        name:symbol _ 
        layer_type: (("user" _ value:string {return value})/symbol) _ 
        hide:("hide" _ )? 
    ")"{
    const value = [
        {type: "index", value: index},
        {type: "name", value: name},
        {type: "layer_type", value: layer_type},
        {type: "hide", value: { type: "boolean", value: !!hide }} 

        ]
    return { type: "layer", value }
}

// --------------------------------------------------
// setup
// --------------------------------------------------

setup /* parseSetup */
 =  "(" _ 
    type:"setup" _ 
    values:(
        (setup_boardunits / 
        setup_flag / 
        setup_array / 
        setup_hex / 
        defaults / 
        unsupported_setup) _ 
        )* 
    ")"{ 
    return {type, value:values.map(x => x[0])}
 }

setup_flag
    = "(" _ type:SETUP_FLAG _ value:bool _ ")" { return { type, value } }
SETUP_FLAG
 = "filled_areas_thickness"
 / "blind_buried_vias_allowed"
 / "uvias_allowed"
 / "zone_45_only"

setup_boardunits
 = "(" _ type:SETUP_BOARDUNITS _ value:number _ ")" { return { type, value } }

SETUP_BOARDUNITS
 = "last_trace_width"
 / "user_trace_width"
 / "trace_clearance"
 / "zone_clearance"
 / "clearance_min"
 / "trace_min"
 / "via_size"
 / "via_drill"
 / "via_min_annulus"
 / "via_min_size"
 / "through_hole_min"
 / "via_min_drill"
 / "hole_to_hole_min"
 / "uvia_size"
 / "uvia_drill"
 / "uvia_min_size"
 / "uvia_min_drill"
 / "segment_width"
 / "edge_width"
 / "mod_edge_width"
 / "pcb_text_width"
 / "mod_text_width"
 / "pad_to_mask_clearance"
 / "solder_mask_min_width"
 / "pad_to_paste_clearance_ratio"
 / "pad_to_paste_clearance"
 / "max_error"
 / "pad_drill"
 / "pad_to_paste_clearance_ratio" // double, not board units...

setup_hex
 = "(" _ type:"visible_elements" _ value:hex _ ")" { return { type, value } }

setup_array
 = "(" _ type:SETUP_ARRAY _ value:(number _)+ ")" { 
     return {type,value: value.map(x => x[0])}
     }
SETUP_ARRAY
 = "user_via"
 / "user_diff_pair"
 / "pcb_text_size"
 / "mod_text_size"
 / "pad_size"
 / "aux_axis_origin"
 / "grid_origin"


defaults /* parseSetup */
 =  "(" _ type:"defaults" _ values:(default_boardunits / default_int / default_text_dims _ )* ")"{ 
    return {type, value:values.map(x => x[0])}
}

default_boardunits
 = "(" _ type:DEFAULT_BOARDUNITS _ value:number _ ")" { return { type, value } }

DEFAULT_BOARDUNITS
 = "T_edge_clearance"
 / "T_copper_line_width"
 / "T_courtyard_line_width"
 / "T_edge_cuts_line_width"
 / "T_silk_line_width"
 / "T_fab_layers_line_width"
 / "T_other_layers_line_width"

default_int
 = "(" _ type:DEFAULT_INT _ value:digits _ ")" { return { type, value } }

DEFAULT_INT
 = "dimension_units"
 / "dimension_precision"

default_text_dims
 = "(" _ type:DEFAULT_TEXT_DIMS _ attrs:(( size/thickness/bold/italic) _ )* ")" { 
    return { type, value: attrs.map(x => x[0]) }
}
DEFAULT_TEXT_DIMS
 = "copper_text_dims"
 / "silk_text_dims"
 / "fab_layers_text_dims"
 / "other_layers_text_dims"

unsupported_setup
 = "(" _ type:("stackup"/"pcbplotparams") _ (expression _ )* ")" { 
     // console.log(`Warning: unsupported setup section ${type}`)
     return {type,value: { type: "string", value: "unsupported" } } 
}

// --------------------------------------------------
// nets
// --------------------------------------------------

net /* parseNETINFO_ITEM */
 =  "(" _ type:"net" _ net_number:digits _ name:(v:(string/symbol) _ {return v})? ")"{ 
     var value = [
         { type: "net_number", value: { type: "string", value: net_number } }
     ]
     if(name)
        value.push({ type: "name", value:name })
    return {type, value }
}

net_class /* parseNETCLASS */
 =  "(" _ 
    type:"net_class" _ 
    name: (string/symbol) _ 
    description: (string/symbol) _ 
    options: ( opt:(net_class_symbol / net_class_boardunit) _ { return opt })*
    ")"{ 
    return {type, 
        value: [ 
            { type: "name", value: name},
            { type: "description", value: description},
            ...options ]
    }
}

net_class_symbol
 = "(" _ type:"add_net" _ value:(string/ symbol / number ) _ ")" { return { type, value } }

net_class_boardunit
 = "(" _ type:NET_CLASS_BOARDUNIT _ value:number _ ")" { return { type, value } }

NET_CLASS_BOARDUNIT
 = "clearance"
 / "trace_width"
 / "via_dia"
 / "via_drill"
 / "uvia_dia"
 / "uvia_drill"
 / "diff_pair_width"
 / "diff_pair_gap"

dimension /* parseDIMENSION() */
 =  "(" _ 
        type:"dimension" _ 
        dimension: number _ 
        width: width _ 
        options: ( (layer / tstamp / gr_text / dimension_xy) _ )*")"{ 
    return {
        type , 
        value: [
            { type: "dimension", value: dimension },
            width,
            ...options.map(x => x[0])
        ], 
    }
}

dimension_xy
 =  "(" _ type:DIMENSION_XY _ value:pts _ ")" { return { type, value:[value] } }

DIMENSION_XY
 = "feature1"
 / "feature2"
 / "crossbar"
 / "arrow1a"
 / "arrow1b"
 / "arrow2a"
 / "arrow2b"

segment /* parseTRACK() */
 =  "(" _ type:"segment" _ value:(v:(start / end / width / net / layer / tstamp / status ) _ { return v } )* ")"{ 
     return { type, value }
}

arc /* parseARC() */
 =  "(" _ type:"arc" _ value: (v:(start / mid / end / width / net / layer / tstamp / status ) _ { return v } )* ")"{ 
     return {type, value }
}

target /* parsePCB_TARGET() */
 =  "(" _ type:"target" _ value:((target_flag / at / size1 / width / layer / tstamp) _ )* ")"{ 
     return {type, value: value.map(x => x[0])}
}

target_flag
 = value:("x"/"plus") {
     return {type:"shape",value: { type: "string", value: value} }
 }


via  /* parseVIA */ 
 =  "(" _ type:"via" _ value:((via_param / via_flag / at  / size1  / layers / tstamp / status) _ )*  ")"{ 
    return { type, value: value.map(x => x[0])}
}

via_flag
 = type:$("blind"/"micro") {
     return { 
         type, 
         value: { type: "boolean", value: true }
    }
 }

via_param
 =  "(" _
        type:$("zone"/"drill"/"net") _
        value:(v:(number/symbol) _ {return v})
    ")"{ 
    return { type, value }
}

polygon=
   "(" _ type:("polygon"/"filled_polygon") _ value: pts _ ")"  {
       return { type, value: [ value ] }
   }

zone  /* parseZONE_CONTAINER */
 =  "(" _ type:"zone" _ value:( v:(
        layers/
        layer/
        zone_param/
        tstamp /
        zone_connect_pads/
        zone_hatch/
        zone_fill/
        zone_keepout /
        polygon /
        fill_segments
        ) _ { return v })* 
    ")"{ 
    return { type, value }
}

fill_segments
  = "(" _ type:"fill_segments" _ value:(pts:pts _ {return pts})+ ")" {
      return { type, value }
  }

zone_param
 = "(" _ type:$("net_name"  /
                "net" /
                "target" /
                "priority" /
                "min_thickness" /
                "filled_areas_thickness" )
        _ value:(v:(string/symbol/number) _ {return v}) ")"{ 
            return { type, value }
}

zone_hatch
 = "(" _ 
        type:"hatch" _ 
        style:("none"/"edge"/"full") _ 
        pitch:number _ 
    ")" {
     return { 
         type, 
         value: [ 
             { type: "style", value: { type: "string", value: style } }, 
             { type: "pitch", value: pitch }, 
             ] }
 }

zone_fill
    = "(" _ 
        type:"fill" _
        filled:("yes" _ )? 
        value: ( (fill_options / fill_mode / fill_smoothing) _ )*
    ")"
    {
        value = value.map(x => x[0])
        if(filled) 
            value.push({ type:"filled", value: { type: "boolean", value: true } })
        else 
            value.push({ type:"filled", value: { type: "boolean", value: false }})
        return {type, value}
}

fill_mode = "(" _ type:"mode" _ value:("polygon" / "hatch" / "segment") _ ")" {
    return { type, value: { type: "string", value } }
}

fill_smoothing = "(" _ type:"smoothing" _ value:("none" / "chamfer" / "fillet") _ ")" { 
    return { type, value: { type: "string", value } }
}

fill_options 
  =  "(" _ 
    type:( 
        "hatch_thickness" / 
        "hatch_gap" / 
        "hatch_orientation" / 
        "hatch_smoothing_level" / 
        "hatch_smoothing_value" / 
        "arc_segments" / 
        "thermal_gap" / 
        "thermal_bridge_width" / 
        "radius" 
        ) _ 
        value:number _ 
        ")"{
      return { type, value }
  }

zone_keepout 
 = "(" _ 
        type:"keepout" _ 
        value: ( "(" _ 
            t:("tracks"/"vias"/"copperpour"/"pads"/"footprints") _
            v:("allowed"/"not_allowed") _
        ")" _ 
        { return { type: t, value: { type: "string", value: v } } } )*
    ")" {
    return { type, value }
 }

zone_connect_pads
    = "(" _
        type: "connect_pads" _
        connection:( v:("yes"/"no"/"thru_hole_only") _ { return { type: "string", value: v } })? 
        clearance:("(" _ "clearance" _ c:number _ ")" _ { return c })?
    ")" {
    var value = []
    if(connection)
        value.push({ type: "connection", value: connection }) 
    if(clearance)
        value.push({ type: "clearance", value: clearance }) 
    return { type, value }
}


header /* parseHeader */ 
  =  version:(header_version _ )?
        "(" _ symbol _ (string/symbol) _ (string/symbol _)? ")"
    {
    var out = []
    if(version)
        out.push(version[0])
    return out
};

header_version
 = "(" _ 
    type:"version" _ 
    value:digits _ 
    ")" {
        return { type, value: { type:"number", value } }
    }

module  /* parseMODULE_unchecked */ 
    = _  "(" _ 
            type:("footprint"/"module") _ 
            value:(string/symbol) _ 
            contents:( module_contents _ )* 
        ")" _  {
        return {
            type: "module",
            value: [
                {type: "name", value},
                ...contents.map(x=>x[0])
            ]
        }
    }

module_contents
    = version
    / locked
    / placed 
    / layer
    / tedit 
    / tstamp
    / at
    / descr
    / tags
    / path 
    / common_numeric // / solder_mask_margin / solder_paste_margin / solder_paste_ratio / clearance / thermal_width / thermal_gap
    / common_int // / autoplace_cost90 / autoplace_cost180 / zone_connect
    / module_attr // T_attr
    / fp_text
    / fp_arc
    / fp_circle
    / fp_curve
    / fp_line
    / fp_rect
    / fp_poly
    / pad
    / model
    / zone; 


version = "(" _ type: "version" _ value:symbol _ ")" { return { type, value }}
locked  = "locked" { return { type: "locked", value: { type: "boolean", value: true }  }}
placed  = "placed"{ return { type: "placed", value: { type: "boolean", value: true }}}

// ----------------------------------------
// ----------------------------------------

// layer = "(" _ "layer" _ layers:((LAYER / symbol) _)* ")" { 
//     return { 
//         type:"layer", 
//         value:layers.map(x => x[0])
//     }
// }

layer = "(" _ type: "layer" _ value:(LAYER / symbol) _ ")" { 
    return { type, value }
}

_LAYER  
    = value:("B.Adhes"
     /"F.Adhes"
     /"B.Paste"
     /"F.Paste"
     /"B.SilkS"
     /"F.SilkS"
     /"B.Mask"
     /"F.Mask"
     /"B.Fab"
     /"F.Fab"
     /"B.CrtYd"
     /"F.CrtYd"
     /"Dwgs.User"
     /"Cmts.User"
     /"Eco1.User"
     /"Eco2.User"
     /"Edge.Cuts"
     ) {
        return { type: "string", value } 
    }

LAYER = 
    _LAYER / CU_LAYER



// ----------------------------------------
// ----------------------------------------

tedit = "(" _ "tedit" _  tedit:hex _ ")" { return { type:"tedit", value:tedit } }

tstamp = "(" _ "tstamp" _  tstamp:(string/symbol) _ ")" { // TODO: (string/symbol) is probably wrong
    return { 
        type:"tstamp", 
        value:tstamp 
    } 
} 

// ------------------------------
// `at` (with effects)
// ------------------------------

effects
    = "(" _ type:"effects" _ effects:((font / justify / hide) _ )*  ")" {
        return { type, value: effects.map(x => x[0]) }
    }

font 
    = "(" _ type:"font" _ attrs:(( size/thickness/bold/italic) _ )* ")" {
        return { 
            type, 
            value: attrs.map(x => x[0]) 
        }
    }

thickness 
    = "(" _ type:"thickness" _ value:number _ ")" { 
        return { type, value }
    }

bold = type:"bold" { return { type, value: { type: "boolean", value: true } }}
italic = type:"italic" { return { type, value: { type: "boolean", value: true } }}

justify = "(" _ type:"justify" _ justify: (JUSTIFY _ )* ")" { 
    return { type, value: justify.map(x => x[0]) }
}

JUSTIFY
    = value:("left"
    / "right"
    / "top"
    / "bottom"
    / "mirror") {
        return {type:"string",value}
    };

hide = type:"hide" { return { type, value:{ type: "boolean", value: true } }}

// ----------------------------------------
// more module attributes
// ----------------------------------------

descr = "(" _ type:"descr" _ value:(string/symbol) _ ")" { 
    return { type, value } // TODO: symbols is probably wrong
    } 
tags = "(" _ type:"tags" _ value:(array/string/symbol/number) _ ")" { 
    return { type, value }
    }
path = "(" _ type:"path" _ value:(string/symbol/number) _ ")" { 
    return { type, value }
    }

// --------------------------------------------------
// common between pad and mocule
// --------------------------------------------------

common_numeric =   "(" _ type: COMMON_NUMERIC _ value:number _ ")" { return { type, value }}
COMMON_NUMERIC
    = "solder_paste_margin_ratio"
    / "solder_mask_margin"
    / "solder_paste_margin"
    / "solder_paste_ratio"
    / "thermal_width"
    / "clearance"
    / "thermal_gap"

common_int =   "(" _ type: COMMON_INT _ value:number _ ")" { return { type, value }}
COMMON_INT
    = "zone_connect"
    / "autoplace_cost90"
    / "autoplace_cost180"

module_attr 
    =   "(" _ "attr" _ value:("smd"/"virtual") _ tags:(tag:(array/string/symbol/number) _ {return tag}) * ")" {
        return  {
            type: "module_attribute",
            value: {type:"string",value},
            tags
        }
}

// --------------------------------------------------
// fp text
// --------------------------------------------------

// parseTEXTE_MODULE

fp_text
    = "("_ 
        type:"fp_text" _ 
        text_type:("reference"/"value"/"user") _ 
        value:(string/symbol/number) _  
        at:at? _ 
        attrs:((layer/hide/effects/tstamp) _)* 
        ")" {
        return { 
            type, 
            value: [ 
                {type:"text",value},
                { 
                    type: "type",
                    value: {
                        type:"string",
                        value:text_type
                        }
                    },
                 at, 
                 ...attrs.map(x => x[0])
                 ] 
        }
    }

//text_at = "(" _ "at" _ x:number _ y:number _ ")" { return { type:"at", value: [x, y]} }

// --------------------------------------------------
// fp SHAPES
// --------------------------------------------------

fp_arc
    =  "(" _ type:"fp_arc" _ center:_start _ end:end _ angle:(angle _ )?   generics:fp_generics  ")" {
        const out = [ center, end]
        if(angle !== null){
            out.push( angle[0])
        }
        return {
            type,
            value: [ ...out , ...generics ]
        };
    }

fp_circle
    =  "(" _ type:"fp_circle" _  center:center _ end:end _  generics:fp_generics _ ")" {
        return {
            type,
            value: [ center, end, ...generics ]
        };
    }

fp_curve
    =  "(" _ type:"fp_curve" _ pts:curve_points _   generics:fp_generics ")" {
        return {
            type,
            value:[ ...pts, ...generics ]
        };
    }

fp_line
    =  "(" _ type:"fp_line" _  start:start _ end:end _  generics:fp_generics ")" {
        return {
            type,
            value: [ start, end, ...generics ]
        };
    }

fp_rect
    =  "(" _ type:"fp_rect" _  start:start _ end:end _  generics:fp_generics ")" {
        return {
            type,
            value: [ start, end, ...generics ]
        };
    }

fp_poly
    =  "(" _ type:"fp_poly" _  pts:pts _   generics:fp_generics ")" {
        return {
            type,
            value: [ pts , ...generics ]
        };
    }

fp_generics
    = generics:((layer / width / fill / tstamp / status) _ )* {
        return generics.map(x => x[0])
    }

// --------------------------------------------------
// pads
// --------------------------------------------------

pad
    = "(" _ 
        "pad" _ 
        no:(string/symbol)? _ 
        pad_type:pad_type _ 
        shape:pad_shape _ 
        locked:("locked" _ )?
        attrs:(pad_attr _)* ")" { 
        return { 
            type: "pad",
            value: [ 
                { type: "pad_id", value:no }, 
                pad_type,
                shape,
                { type: "locked", value: { type: "boolean", value: !!locked } }, 
                  ...attrs.map(x => x[0]) 
            ]
        } 
    }

pad_type 
    = value:("thru_hole"/"np_thru_hole" /"smd"/"connect") {
         return { type: "pad_type", value: { type: "string", value } }
    }

pad_shape
    = value:("circle"/"rect"/"oval"/"trapezoid"/"roundrect"/"custom")  {
        return { type: "pad_shape", value: { type: "string", value } }
    }

pad_attr 
    = size
    / at
    / rect_delta
    / drill
    / layers
    / tstamp
    / net  // not relvant for modules
    / common_numeric // / solder_mask_margin / solder_paste_margin / solder_paste_ratio / clearance / thermal_width / thermal_gap
    / common_int // / autoplace_cost90 / autoplace_cost180 / zone_connect
    / pad_numeric
    / chamfer
    / pad_options
    / primitives;

chamfer
 = "(" _ 
    type:"chamfer" _ 
    value:(value:("top_left" /
                "top_right" /
                "bottom_left" /
                "bottom_right"
                ) _ {return { type: "string", value }})+ 
    ")" {
        return {type,value}
    }




size1 
    = "(" _ type:"size" _ value:number _ ")" { 
        return { type, value } 
    }


size 
    = "(" _ type:"size" _ width:number _ height:number _ ")" { 
        return { 
           type, 
            value:  [ 
                { type: "height", value: height },
                { type: "width", value: width },
                ] 
            } 
    }

at 
    = "(" _ type:"at" _ x:number _ y:number _ angle:(number _)? unlocked:("unlocked" _)?")" { 
        var value = [
            { type: "x", value:x }, 
            { type: "y", value:y }, 
            { type: "unlocked", value: { type: "boolean", value: !!unlocked } },
        ]
        if(angle !== null) value.push( { type: "angle", value:angle[0] } ) 
        return { type, value } 
    }

rect_delta 
    = "(" _ type:"rect_delta" _ width:number _ height:number _ ")" {
        return { 
                type, 
                value: [ 
                        { type:"width", value:width },
                        { type:"height", value:height },
                    ]
                }
    }

// --------------------------------------------------
// drill
// --------------------------------------------------

drill
    = "(" _ type:"drill" _ attrs:((oval/number/offset) _ ) * ")" {

        var height,width 
        var value = []
        for(const ATTR of attrs){
            var attr = ATTR[0]
            if(attr.type == "number" ){
                height = { type: "height", value: attr }
                if(!width){
                    width = { type: "width", value: attr }
                }
            }else{
                value.push(attr)
            }
        }

        if(height)
            value.splice(0,0,height)

        if(width)
            value.splice(0,0,width)

        return { type, value }

    }

oval =  type:"oval" { return { type, value: { type: "boolean", value: true } } }
offset = "(" _ type:"offset" _ x:number _ y:number _ ")" {
    return { 
        type,
        value: [
            { type: "x", value: x },
            { type: "y", value: y }
        ]
    }

}


// parseBoardItemLayersAsMask
layers 
    = "(" _ type:"layers" _ value:(val:(LAYERS/string/symbol) _ {return val})*  ")" { 
        return { type, value } 
    }

// --------------------------------------------------
//  pad specific numeric options
// --------------------------------------------------

pad_numeric =   "(" _ type: PAD_NUMERIC _ value:number _ ")" { return { type, value } }

PAD_NUMERIC
    = "chamfer_ratio"
    / "roundrect_rratio"
    / "die_length"

// --------------------------------------------------
// pad options
// --------------------------------------------------

pad_options  /* parseD_PAD_option */ 
    = "(" _ type:"options" _ value:(val:(option_anchor/option_clearance) _ {return val})*  ")" {
        return { type, value }
    }

option_anchor
    = "(" _ type:"anchor" _ value:("circle"/"rect") _ ")" { 
        return { type, value: { type: "string", value: value}}
    }

option_clearance 
    = "(" _ type:"clearance" _ value:("outline"/"convexhull") _ ")" { 
        return { type, value: { type: "string", value } }
    }

// --------------------------------------------------
// pad primitives
// --------------------------------------------------

primitives 
    = "(" _ type:"primitives" _ value:( val:primitive_shape _  { return val })* ")" {
        return { type, value }
    }

primitive_shape
    = gr_arc 
    / gr_line 
    / gr_rect 
    / gr_circle 
    / gr_poly 
    / gr_curve ;

gr_arc
    =  "(" _ type:"gr_arc" _ center:_start _ end:end _  generics:gr_generics  ")" {
        return {
            type,
            value:[ center, end, ...generics ]
        };
    }

gr_circle
    =  "(" _ type:"gr_circle" _  center:center _ end:end _ generics:gr_generics ")" {
        return {
            type,
            value:[ center, end, ...generics ]
        };
    }

gr_curve
    =  "(" _ type:"gr_curve" _ pts:curve_points _ generics:gr_generics ")" {
        return {
            type,
            value:[ ...pts, ...generics ]
        };
    }

curve_points
    = "(" _ "pts" _ start:xy _ control1:xy _ control2:xy _ end:xy _ ")" {
        // console.log("start", start)
        // console.log("control1", control1)
        // console.log("control2", control2)
        // console.log("end", end)
        // console.log(JSON.stringify([
        //         { type:"start", value: start.value  },
        //         { type:"control1", value:  control1.value },
        //         { type:"control2", value:  control2.value },
        //         { type:"end", value: end.value },
        //     ],null,2))
        // process.exit()
        return [
                { type:"start", value: start.value  },
                { type:"control1", value:  control1.value },
                { type:"control2", value:  control2.value },
                { type:"end", value: end.value },
            ]
    }

gr_line
    =  "(" _ type:"gr_line" _  start:_start _ end:end _ generics:gr_generics ")" {
        return {
            type,
            value:[ start, end, ...generics ]
        };
    }

gr_rect
    =  "(" _ type:"gr_rect" _  start:_start _ end:end _ generics:gr_generics ")" {
        return {
            type,
            value:[ start, end, ...generics ]
        };
    }

gr_poly
    =  "(" _ type:"gr_poly" _  pts:pts _  generics:gr_generics  ")" {
        return {
            type,
            value: [ pts, ...generics ]
        };
    }

gr_text
 = "(" _ 
    type:"gr_text" _ 
    text: (string / symbol) _ 
    at:at _ 
    options:( (layer  / tstamp / effects) _ ) *  
    ")" {

     const value  = [
         {type: "text", value: text}, 
         at,
         ...options.map(x => x[0])
         ]
     return {type, value}

}

gr_generics
    = generics:( (angle /layer / width / fill / tstamp / status )_)* {
        return generics.map(x => x[0])
    }

status = "(" _ type:"status" _  value:hex _ ")" { 
    return { type, value } 
}

fill 
    = "(" _ type:"fill" _  value:symbol _ ")" {
        return { type, value } 
    }

width 
    = "(" _ type:"width" _  value:number _ ")" {
        return { type, value } 
    }

angle 
    = "(" _ type:"angle" _ value:number _ ")" {
        return { type, value }
    }

mid 
    = "(" _ type:"mid" _ value:x_y _ ")" { 
        return { type, value }
}

start 
    = "(" _ type:"start" _ value:x_y _ ")" { 
        return { type, value }
}

x_y = 
  x:number _ y:number {
      return [
                {type: "x", value:x},
                {type: "y", value:y},
            ]

  }

_start 
    = "(" _ type: ("start" / "center") _ value:x_y _ ")" { 
        return { type, value } // yep, "center"
}
center 
    = "(" _ type:"center" _ value:x_y _ ")" {
        return { type, value }
    }
end 
    = "(" _ type:"end" _ value:x_y _ ")" {
        return { type, value }
    }
pts 
    = "(" _ type:"pts" _ pts:(xy _ )+")" {
        return { type, value: pts.map(x => x[0])}
    }
xy 
    = "(" _ type:"xy" _ value:x_y _ ")" {
        return { type, value }
    }

// ----------------------------------------
// 3d model: 
// ----------------------------------------

model
    = "(" _ 
        type:"model" _ 
        filename:(string/symbol) _   
        attr:((model_xyz_attr/ hide / opacity)_ )* _ 
        ")" {
        return {
            type,
            value: [
                {type:"filename",value:filename},
                ...attr.map(x => x[0])
            ]
        }
    }

opacity = "(" _ "opacity" _  value:number _ ")" { return { type:"opacity", value:value } }

model_xyz_attr
 = "(" _ 
        type:("at"/"offset"/"scale"/"rotate") _ 
        value:xyz _  
    ")" { 
        return { type, value: [ value ]  } 
    }

xyz =   "(" _ 
            type:"xyz" _
            x:number _
            y:number _
            z:number _
        ")" { 
            return { type, value:[
                {type: "x", value:x},
                {type: "y", value:y},
                {type: "z", value:z}
            ] } 
        }

// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------
// --------------------------------------------------

// --------------------------------------------------
// strings
// --------------------------------------------------

string
  = '"' chars:DoubleStringCharacter* '"' { return {type:"string",value:chars.join('')}; }
  / "'" chars:SingleStringCharacter* "'" { return {type:"string",value:chars.join('')}; }

DoubleStringCharacter
  = !('"' / "\\") char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

SingleStringCharacter
  = !("'" / "\\") char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
  = "'"
  / '"'
  / "\\"
  / "b"  { return "\b";   }
  / "f"  { return "\f";   }
  / "n"  { return "\n";   }
  / "r"  { return "\r";   }
  / "t"  { return "\t";   }
  / "v"  { return "\x0B"; }


// skipping net, pinfunction, die_llength

// --------------------------------------------------
// generic s-expression (for ignoring things...)
// --------------------------------------------------

sexp
 = _ "(" _ contents:( expression _ )* ")" _ {
     return { 
         type: "sexp",
         value: contents.map(x => x[0])
       }
 }

expression = number / string / array / symbol / sexp / hex

// --------------------------------------------------
// BASIC TYPES
// --------------------------------------------------

array
    = "[" _ value:(string/symbol/number) _  values:((string/symbol/number) _ "," _ )*"]" {
        return {
            type: "array",
            value: [ value, ...values.map(x => x[0])]
        }
    }


symbol 
   = value:$([^ ();'\n]+) {
       return {type:"string",value}

   }

_ "whitespace"
  = [ \t\n\r]*

// <number>::= [<sign>] [<positive_integer> | <real> | <fraction>]
number
    = val:$([-+]?  (Real/Fraction/digits)) {
        return { type:"number", value:val }
    }

number_ 
    = value:number _ 
        { return value }

Real
  = val:$((digits("."(digits?))?) / "." digits) {
      return { type:"real", value:val }

  }
  
Fraction 
  = n:digits "/" d:digits {
      return { type:"fraction", n:n, d:d }
  }

// <positive_integer>::= [<digit> | <digit><positive_integer>]
digits = $([0-9]+)

// <sign>::= [+ | -]
// <real>::= [<positive_integer>. | <positive_integer>.<positive_integer> | <positive_integer>]
// <fraction>::= <positive_integer> / <positive_integer>

hex 
    = value:$([0-9a-fA-F]+) {
        return {type: "hex", value}

    }

bool
  = value:("yes" / "no"){ return { type: "boolean", value: value === "yes" } }

cu_layer
    = "(" _ type:"layer" _  value: CU_LAYER _ ")" { return { type, value } }

CU_LAYER  
    = value:("F.Cu" / "B.Cu" / 
      "In1.Cu" / "In2.Cu" / "In3.Cu" / "In4.Cu" / "In5.Cu" /
      "In6.Cu" / "In7.Cu" / "In8.Cu" / "In9.Cu" / "In10.Cu" /
      "In11.Cu" / "In12.Cu" / "In13.Cu" / "In14.Cu" / "In15.Cu" /
      "In16.Cu" / "In17.Cu" / "In18.Cu" / "In19.Cu" / "In20.Cu" /
      "In21.Cu" / "In22.Cu" / "In23.Cu" / "In24.Cu" / "In25.Cu" /
      "In26.Cu" / "In27.Cu" / "In28.Cu" / "In29.Cu" / "In30.Cu" 
    ) {
        return { type: "string", value} 
    }


LAYER_MASKS
    = value:("*.Cu"
    / "*In.Cu"
    / "F&B.Cu"
    / "*.Adhes"
    / "*.Paste"
    / "*.Mask"
    / "*.SilkS"
    / "*.Fab"
    / "*.CrtYd"
    / "Inner"[1-9]".Cu"
    / "Inner1"[01-4]".Cu") {
        return { type: "string", value} 
    }

LAYERS
    = LAYER / CU_LAYER / LAYER_MASKS;
