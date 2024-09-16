kicad_symbol_lib
  = "("
    _
    type:"kicad_symbol_lib"
    _
    value:(
      val:(version / generator / generator_version / kicad_symbol) _ {
          return val;
        }
    )*
    ")"
    _ { return { type, value }; }

version
  = "(" _ type:"version" _ value:digits _ ")" {
      return { type, value: { type: "number", value } };
    }

generator
  = "(" _ type:"generator" _ value:(string / symbol) _ ")" {
      return { type, value };
    }

generator_version
  = "(" _ type:"generator_version" _ value:string _ ")" {
      return { type, value };
    }

kicad_symbol
  = "(" _ type:"symbol" _ rest:kicad_symbol_element+ ")" {
      return { type, value: rest };
    }

kicad_symbol_element
  = value:(
      library_id
      / power
      / extends
      / pin_names
      / pin_numbers
      / exclude_from_sim
      / in_bom
      / on_board
      / pin
      / rectangle
      / circle
      / arc
      / polyline
      / text
      / property
      / kicad_symbol
    )
    _ { return value; }

exclude_from_sim
  = "(" _ type:"exclude_from_sim" _ value:bool _ ")" {
      return { type, value: { type: "boolean", value: value === "yes" } };
    }

library_id = value:string { return { type: "id", value }; }

power
  = "(" _ type:"power" _ ")" {
      return { type, value: { type: "boolean", value: true } };
    }

extends
  = "(" _ type:"extends" _ value:string _ ")" {
      return { type, value };
    }

pin_numbers
  = "("
    _
    type:"pin_numbers"
    _
    rest:(val:(offset / hide_token) _ { return val; })*
    ")" { return { type, value: rest }; }

pin_names
  = "("
    _
    type:"pin_names"
    _
    rest:(val:(offset / hide_token) _ { return val; })*
    ")" { return { type, value: rest }; }

hide_token
  = value:"hide" _ {
      return {
        type: "hide",
        value: { type: "boolean", value: true },
      };
    }

offset = "(" _ type:"offset" _ value:number _ ")" { return { type, value }; }

in_bom
  = "(" _ type:"in_bom" _ value:bool _ ")" {
      return { type, value: { type: "boolean", value: value === "yes" } };
    }

on_board
  = "(" _ type:"on_board" _ value:bool _ ")" {
      return { type, value: { type: "boolean", value: value === "yes" } };
    }

property
  = "("
    _
    "property"
    _
    name:string
    _
    value:string
    _
    rest:(val:(at / effects / property_id) _ { return val; })+
    ")" {
      return {
        type: "properties",
        value: [
          { type: "key", value: name },
          { type: "value", value },
          ...rest,
        ],
      };
    }

property_id = "(" _ "id" _ value:number _ ")" { return { type: "id", value }; }

graphic_item
  = arc
  / circle
  / bezier
  / polyline
  / rectangle
  / text

arc
  = "("
    _
    "arc"
    _
    start:start
    _
    mid:mid
    _
    end:end
    _
    stroke_definition:stroke_definition
    _
    fill:fill
    _
    ")" {
      return { type: "arc", value: [start, mid, end, stroke_definition, fill] };
    }

circle
  = _
    "("
    _
    "circle"
    _
    center:center
    _
    radius:radius
    _
    stroke_definition:stroke_definition
    _
    fill:fill
    _
    ")"
    _ {
      return {
        type: "circle",
        value: [center, radius, stroke_definition, fill],
      };
    }

bezier
  = _ "(" _ "bezier" _ pts _ stroke_definition _ fill _ ")" _ {
      return { type: "bezier", value: [pts, stroke_definition, fill] };
    }

polyline
  = _
    "("
    _
    "polyline"
    _
    pts:pts
    _
    stroke_definition:stroke_definition
    _
    fill:fill
    _
    ")"
    _ { return { type: "polyline", value: [pts, stroke_definition, fill] }; }

rectangle
  = "("
    _
    "rectangle"
    _
    start:start
    _
    end:end
    _
    stroke_definition:stroke_definition
    _
    fill:fill
    _
    ")" {
      return {
        type: "rectangle",
        value: [start, end, stroke_definition, fill],
      };
    }

radius
  = "(" _ "radius" _ value:number _ ")" _ { return { type: "radius", value }; }

mid = "(" _ type:"mid" _ value:x_y _ ")" { return { type, value }; }

start = "(" _ type:"start" _ value:x_y _ ")" { return { type, value }; }

x_y
  = x:number _ y:number {
      return [
        { type: "x", value: x },
        { type: "y", value: y },
      ];
    }

_start
  = "(" _ type:("start" / "center") _ value:x_y _ ")" {
      return { type, value }; // yep, "center"
    }

center = "(" _ type:"center" _ value:x_y _ ")" { return { type, value }; }

end = "(" _ type:"end" _ value:x_y _ ")" { return { type, value }; }

pts
  = "(" _ type:"pts" _ pts:(xy _)+ ")" {
      return { type, value: pts.map((x) => x[0]) };
    }

xy = "(" _ type:"xy" _ value:x_y _ ")" { return { type, value }; }

text
  = "(" _ type:"text" _ value:string _ at:at _ effects:effects _ ")" {
      return { type, value: [{ type: "value", value }, at, effects] };
    }

pin
  = _
    "("
    _
    "pin"
    _
    rest:(
      val:(
          pin_graphic_style
          / pin_electrical_type
          / alternate
          / at
          / length
          / hide_token
          / pin_name
          / pin_number
        )
        _ { return val; }
    )+
    ")"
    _ { return { type: "pin", value: rest }; }

pin_electrical_type
  = value:(
    "input"
    / "output"
    / "bidirectional"
    / "tri_state"
    / "passive"
    / "free"
    / "unspecified"
    / "power_in"
    / "power_out"
    / "open_collector"
    / "open_emitter"
    / "no_connect"
  ) {
      return { type: "pin_electrical_type", value: { type: "string", value } };
    }

pin_graphic_style
  = value:(
    "inverted_clock"
    / "line"
    / "inverted"
    / "input_low"
    / "clock_low"
    / "clock"
    / "output_low"
    / "edge_clock_high"
    / "non_logic"
  ) { return { type: "pin_graphic_style", value: { type: "string", value } }; }

pin_name
  = "(" _ "name" _ value:string _ (effects:effects _)? ")" {
      var values = [{ type: "value", value }];
      if (typeof effects !== "undefined") values.push(effects);
      return {
        type: "pin_name",
        value: values,
      };
    }

pin_number
  = "(" _ "number" _ value:string _ (effects _)? ")" {
      var values = [{ type: "value", value }];
      if (typeof effects !== "undefined") values.push(effects);
      return {
        type: "pin_number",
        value: values,
      };
    }

//(alternate "ALERT" open_collector line)
alternate
  = "("
    _
    type:"alternate"
    _
    name:symbol
    _
    rest:(val:(pin_graphic_style / pin_electrical_type) _ { return val; })+
    ")"
    _ { return { type, value: [{ type: "name", value: name }, ...rest] }; }

length = "(" _ type:"length" _ value:number _ ")" { return { type, value }; }

unit_name = _ "(" _ "unit_name" _ string _ ")" _

at
  = "("
    _
    type:"at"
    _
    x:number
    _
    y:number
    _
    angle:(number _)?
    unlocked:("unlocked" _)?
    ")" {
      var value = [
        { type: "x", value: x },
        { type: "y", value: y },
        { type: "unlocked", value: { type: "boolean", value: !!unlocked } },
      ];
      if (angle !== null) value.push({ type: "angle", value: angle[0] });
      return { type, value };
    }

stroke_definition
  = _
    "("
    _
    type:"stroke"
    _
    rest:(val:(width / stroke_type / color) _ { return val; })*
    ")" { return { type, value: rest }; }

width = "(" _ type:"width" _ value:number _ ")" { return { type, value }; }

stroke_type
  = "("
    _
    type:"type"
    _
    value:("dash" / "dash_dot" / "dash_dot_dot" / "dot" / "default" / "solid")
    _
    ")" { return { type, value: { type: "string", value } }; }

color
  = "(" _ "color" _ r:number _ g:number _ b:number _ a:number _ ")" {
      return {
        type,
        value: [
          { type: "r", value: r },
          { type: "g", value: g },
          { type: "b", value: b },
          { type: "a", value: a },
        ],
      };
    }

fill
  = "(" _ type:"fill" _ "(" _ "type" _ value:symbol _ ")" _ ")" {
      return { type, value };
    }

effects
  = "(" _ type:"effects" _ effects:((font / justify / hide / hide_token) _)* ")" {
      return { type, value: effects.map((x) => x[0]) };
    }

font
  = "("
    _
    type:"font"
    _
    attrs:(
      (face / size / thickness / bold / italic / bold_token / italic_token) _
    )*
    ")" {
      return {
        type,
        value: attrs.map((x) => x[0]),
      };
    }

thickness
  = "(" _ type:"thickness" _ value:number _ ")" { return { type, value }; }

face = "(" _ type:"face" _ value:string _ ")" { return { type, value }; }

size
  = "(" _ type:"size" _ width:number _ height:number _ ")" {
      return {
        type,
        value: [
          { type: "height", value: height },
          { type: "width", value: width },
        ],
      };
    }

italic = "(" _ type:"italic" _ value:bool _ ")" { return { type, value }; }

italic_token
  = "italic"
    _ { return { type: "italic", value: { type: "boolean", value: true } }; }

bold = "(" _ type:"bold" _ value:bool _ ")" { return { type, value }; }

bold_token
  = "bold"
    _ { return { type: "bold", value: { type: "boolean", value: true } }; }

justify
  = "(" _ type:"justify" _ justify:(JUSTIFY _)* ")" {
      return { type, value: justify.map((x) => x[0]) };
    }

JUSTIFY
  = value:("left" / "right" / "top" / "bottom" / "mirror") {
      return { type: "string", value };
    }

hide = "(" _ type:"hide" _ value:bool _ ")" { return { type, value }; }

bool
  = value:("yes" / "no") { return { type: "boolean", value: value === "yes" }; }

string
  = "\"" chars:DoubleStringCharacter* "\"" {
      return { type: "string", value: chars.join("") };
    }
  / "'" chars:SingleStringCharacter* "'" {
      return { type: "string", value: chars.join("") };
    }

DoubleStringCharacter
  = !("\"" / "\\") char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

SingleStringCharacter
  = !("'" / "\\") char:. { return char; }
  / "\\" sequence:EscapeSequence { return sequence; }

EscapeSequence
  = "'"
  / "\""
  / "\\"
  / "b" { return "\b"; }
  / "f" { return "\f"; }
  / "n" { return "\n"; }
  / "r" { return "\r"; }
  / "t" { return "\t"; }
  / "v" { return "\x0B"; }

char
  = [^"]
  / "\\" [\\"]

number
  = val:$([-+]? (Exponential / Real / Fraction / digits)) {
      return { type: "number", value: val };
    }

number_ = value:number _ { return value; }

Real
  = val:$((digits ("." digits?)?) / "." digits) {
      return { type: "real", value: val };
    }

Exponential
  = val:$((digits / Real) ("e" / "E") ("+" / "-")? digits) {
      return { type: "exponential", value: val };
    }

Fraction = n:digits "/" d:digits { return { type: "fraction", n: n, d: d }; }

digits = $[0-9]+

symbol = value:$[^ ();'\n]+ { return { type: "string", value }; }

_ "whitespace" = [ \t\n\r]*
