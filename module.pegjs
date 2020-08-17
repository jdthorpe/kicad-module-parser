module  /* parseMODULE_unchecked */ 
    = _  "(" _ "module"  _ value:(string/symbol)  _ contents:( module_contents _ )* ")" _  {
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
    / fp_poly
    / pad
    / model
    // zone; // skipping zone for now


version = "(" _ "version" _ version:symbol _ ")" { return { type:"version", value:version }}
locked  = "locked" { return { type: "locked"}}
placed  = "placed"{ return { type: "placed"}}

// ----------------------------------------
// ----------------------------------------

layer = "(" _ "layer" _ layers:(LAYER _)* ")" { 
    return { 
        type:"layer", 
        value:layers.map(x => x[0])
    }
}

LAYER  
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
     / CU_LAYER) {
        return { type: "string", value} 
    }

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
    = "(" _ "effects" _ effects:((font / justify / hide) _ )*  ")" {
        return { type:"effects", value: effects.map(x => x[0]) }
    }

font 
    = "(" _ "font" _ attrs:(( size/thickness/bold/italic) _ )* ")" {
        return { 
            type:"font", 
            value: attrs.map(x => x[0]) 
        }
    }

thickness 
    = "(" _ "thickness" _ value:number _ ")" { 
        return { 
            type:"thickness", value 
        }
    }

bold = "bold" { return { type:"bold"}}
italic = "italic" { return { type:"italic"}}

justify = "(" _ "justify" _ justify: (JUSTIFY _ )* ")" { 
    return { 
        type:"justify", 
        value: justify.map(x => x[0])
    }
}

JUSTIFY
    = value:("left"
    / "right"
    / "top"
    / "bottom"
    / "mirror") {
        return {type:"string",value}
    };

hide = "hide" { return { type:"hide"}}

// ----------------------------------------
// more module attributes
// ----------------------------------------

descr = "(" _ "descr" _ descr:(string/symbol) _ ")" { return { type:"descr", value: descr }} // TODO: symbols is probably wrong
tags = "(" _ "tags" _ tags:(array/string/symbol/number) _ ")" { return { type:"tags", value: tags }}
path = "(" _ "path" _ path:(string/symbol/number) _ ")" { return { type:"path", value: path }}

// --------------------------------------------------
// common between pad and mocule
// --------------------------------------------------

common_numeric =   "(" _ type: COMMON_NUMERIC _ margin:number _ ")" { return { type:type, value: margin }}
COMMON_NUMERIC
    = "solder_paste_margin_ratio"
    / "solder_mask_margin"
    / "solder_paste_margin"
    / "solder_paste_ratio"
    / "thermal_width"
    / "clearance"
    / "thermal_gap"

common_int =   "(" _ type: COMMON_INT _ margin:number _ ")" { return { type:type, value: margin }}
COMMON_INT
    = "zone_connect"
    / "autoplace_cost90"
    / "autoplace_cost180"

module_attr 
    =   "(" _ "attr" _ value:("smd"/"virtual") _ ")" {
        return  {
            type: "module_attribute",
            value: {type:"string",value}
        }
}

// --------------------------------------------------
// fp text
// --------------------------------------------------

// parseTEXTE_MODULE

fp_text
    = "("_ "fp_text" _ type:("reference"/"value"/"user") _ value:(string/symbol/number) _  at:at?  _ attrs:((layer/hide/effects) _)* ")" {
        return { 
            type:"fp_text", 
            value: [ 
                {type:"value",value},
                { 
                    type: "text_type",
                    value: {
                        type:"string",
                        value: type
                        }
                    },
                 at, 
                 ...attrs.map(x => x[0])
                 ] 
        }
    }

//text_at = "(" _ "at"  _ x:number _ y:number _ ")" { return { type:"at", value: [x, y]} }

// --------------------------------------------------
// fp SHAPES
// --------------------------------------------------

fp_arc
    =  "(" _ "fp_arc" _ start:_start _ end:end _ angle:(angle _ )?   generics:fp_generics  ")" {
        return {
            type: "fp_arc",
            value: [ start, end,angle, ...generics ]
        };
    }

fp_circle
    =  "(" _ "fp_circle" _  center:center _ end:end _  generics:fp_generics _ ")" {
        return {
            type: "fp_circle",
            value: [ center, end, ...generics ]
        };
    }

fp_curve
    =  "(" _ "fp_curve" _ pts:curve_points _   generics:fp_generics ")" {
        return {
            type: "fp_curve",
            value:[ pts, ...generics ]
        };
    }

fp_line
    =  "(" _ "fp_line" _  start:_start _ end:end   _  generics:fp_generics ")" {
        return {
            type: "fp_line",
            value: [ start, end, ...generics ]
        };
    }

fp_poly
    =  "(" _ "fp_poly" _  pts:pts _   generics:fp_generics ")" {
        return {
            type: "fp_poly",
            value: [ pts , ...generics ]
        };
    }

fp_generics
    = generics:((layer / width / tstamp / status) _ )* {
        return generics.map(x => x[0])
    }

// --------------------------------------------------
// pads
// --------------------------------------------------

pad
    = "(" _ "pad" _ no:(string/symbol)? _ type:pad_type _ shape:pad_shape _ attrs:(pad_attr _)* ")" { 
        return { 
            type: "pad",
            value: [ {type: "pad_id", value:no }, type, shape, ...attrs.map(x => x[0]) ]
        } 
    }

pad_type 
    = value:("thru_hole"/"np_thru_hole" /"smd"/"connect") {
         return { 
            type: "pad_type", 
            value: value 
        }
    }

pad_shape
    = value:("circle"/"rect"/"oval"/"trapezoid"/"roundrect"/"custom")  {
        return { 
            type: "pad_shape", 
            value:value 
        }
    }

pad_attr 
    = size
    / at
    / rect_delta
    / drill
    / layers
    / tstamp
    // net  // not relvant for modules
    / common_numeric // / solder_mask_margin / solder_paste_margin / solder_paste_ratio / clearance / thermal_width / thermal_gap
    / common_int // / autoplace_cost90 / autoplace_cost180 / zone_connect
    / pad_numeric
    // skipping chamfer, property
    / pad_options
    / primitives;

size 
    = "(" _ "size"  _ width:number _ height:number _ ")" { 
        return { 
           type: "size", 
            value:  [ 
                {type:"height",value:height},
                {type:"width",value:width},
                ] 
            } 
    }

at 
    = "(" _ "at" _ x:number _ y:number _ angle:(number _)? unlocked:("unlocked" _)?")" { 
        var value = [
            { type: "x", value:x }, 
            { type: "y", value:y }, 
        ]
        if(angle !== null) value.push( { type: "width", value:angle[0] } ) 
        if(unlocked !== null) value.push( { type: "unlocked" } ) 
        return { type: "at", value } 
    }

rect_delta 
    = "(" _ "rect_delta"  _ width:number _ height:number _ ")" {
        return { type:"rect_delta", value: [width, height]}
    }

// --------------------------------------------------
// drill
// --------------------------------------------------

drill
    = "(" _ "drill" _ attrs:((oval/number/offset) _ ) * ")" {
        var out = {}
        for(const ATTR of attrs){
            var attr = ATTR[0]
            if(attr.type == "number" ){
                out.height = attr.value
                if(!("width" in out)){
                    out.width = attr.value
                }
            }else{
                Object.assign(out, attr)
            }
        }
        return { type:"drill",value:out }
    }

oval =  "oval" { return { type: "oval"}}
offset = "(" _ "offset"  _ x:number _ y:number _ ")"


// parseBoardItemLayersAsMask
layers 
    = "(" _ "layers" _ layers:((LAYERS/string) _ )*  ")" { 
        return { 
            type:"layers",
            value:layers.map(x => x[0])
        } 
    }

// --------------------------------------------------
//  pad specific numeric options
// --------------------------------------------------

pad_numeric =   "(" _ type: PAD_NUMERIC _ margin:number _ ")" { return { type:type, value: margin }}
PAD_NUMERIC
    = "chamfer_ratio"
    / "roundrect_rratio"
    / "die_length"

// --------------------------------------------------
// pad options
// --------------------------------------------------

pad_options  /* parseD_PAD_option */ 
    = "(" _ "options"  _ value:((option_anchor/option_clearance) _ )*  ")" {
        return { type:"anchor", value:value.map(x=>x[0]) }
    }

option_anchor
    = "(" _ "anchor"  _ value:("circle"/"rect") _ ")" { 
        return { type:"anchor", value }
    }

option_clearance 
    = "(" _ "clearance"  _ value:("outline"/"convexhull") _ ")" { 
        return { type:"clearance", value }
    }

// --------------------------------------------------
// pad primitives
// --------------------------------------------------

primitives 
    = "(" _ "primitives"  _ primitives:( primitive_shape  _  )* ")" {
        return { 
            type:"primitives",
            value: primitives.map(x => x[0])
        };
    }

primitive_shape
    = gr_arc 
    / gr_line 
    / gr_circle 
    / gr_poly 
    / gr_curve ;

gr_arc
    =  "(" _ "gr_arc" _ start:_start _ end:end _  generics:gr_generics  ")" {
        return {
            type: "gr_arc",
            value:[ start, end, ...generics ]
        };
    }

gr_circle
    =  "(" _ "gr_circle" _  center:center _ end:end _ generics:gr_generics ")" {
        return {
            type: "gr_circle",
            value:[ center, end, ...generics ]
        };
    }

gr_curve
    =  "(" _ "gr_curve" _ pts:curve_points  _ generics:gr_generics ")" {
        return {
            type: "gr_curve",
            value:[ pts, ...generics ]
        };
    }

curve_points
    = "(" _ "pts" _ start:xy _ control1:xy _ control2:xy _ end:xy  _ ")" {
        return {
            type: "curve_points",
            value: [
                { type:"start", value:start },
                { type:"control1", value:control1 },
                { type:"control2", value:control2 },
                { type:"end", value:end },
            ]
        }
    }

gr_line
    =  "(" _ "gr_line" _  start:_start _ end:end  _ generics:gr_generics ")" {
        return {
            type: "gr_line",
            value:[ start, end, ...generics ]
        };
    }

gr_poly
    =  "(" _ "gr_poly" _  pts:pts _  generics:gr_generics  ")" {
        return {
            type: "gr_poly",
            value: [ pts, ...generics ]
        };
    }

gr_generics
    = generics:( (angle /layer / width / tstamp / status)_)* {
        return generics.map(x => x[0])
    }

status = "(" _ "status" _  value:hex _ ")" { 
    return { type:"status", value } 
}

width 
    = "(" _ "width" _  width:number _ ")" {
        return { type:"width", value: width } 
    }

angle 
    = "(" _ "angle"  _ angle:number _ ")" {
        return { type:"angle", value: angle }
    }

_start 
    = "(" _ ("start" / "center") _ x:number _ y:number _ ")" { 
        return { type:"start", value: [x, y]
    }
}
center 
    = "(" _ "center"  _ x:number _ y:number _ ")" {
        return { type:"center", value: [x, y]}
    }
end 
    = "(" _ "end"  _ x:number _ y:number _ ")" {
        return { type:"end", value: [x, y]}
    }
pts 
    = "(" _ "pts"  _ pts:(xy _ )+")" {
        return { type:"pts", value: pts.map(x => x[0])}
    }
xy 
    = "(" _ "xy"  _ x:number _ y:number _ ")" {
        return { type:"xy", value: [x, y]}
    }

// ----------------------------------------
// 3d model: 
// ----------------------------------------

model
    = "(" _ "model" _ filename:(string/symbol) _   attr:(model_attr _ )* _ ")" {
        return {
            value: [
                {type:"filename",value:filename},
                ...attr.map(x => x[0])
            ]
        }
    }

model_attr = model_xyz_attr/ hide / opacity


opacity = "(" _ "opacity" _  value:number _ ")" { return { type:"opacity", value:value } }

model_xyz_attr
 = "(" _ type:("at"/"offset"/"scale"/"rotate") _ value:xyz _  ")" { return { type:type, value:value } }

xyz =   "(" _ "xyz" _ x:number _ y:number _ z:number _  ")" { return { type:"xyz", x:x, y:y, z:z } }

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
// BASIC TYPES
// --------------------------------------------------

array
    = "[" _ value:(string/symbol/number) _  values:((string/symbol/number) _ "," _ )*"]" {
        return {
            type: "array",
            values: [ value, ...values.map(x => x[0])]
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
    = $([0-9a-fA-F]+)

cu_layer
    = "(" _ "layer" _  layer: CU_LAYER _ ")" { return { type:"layer", value:layer } }

CU_LAYER  
    = "F.Cu"
    / "B.Cu";

LAYER_MASKS
    = "*.Cu"
    / "*In.Cu"
    / "F&B.Cu"
    / "*.Adhes"
    / "*.Paste"
    / "*.Mask"
    / "*.SilkS"
    / "*.Fab"
    / "*.CrtYd"
    / "Inner"[1-9]".Cu"
    / "Inner1"[01-4]".Cu"

LAYERS
    = value:(LAYER / CU_LAYER / LAYER_MASKS) {
        return { type: "string", value} 
    }
