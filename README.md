# Convert Kicad Board and Module files to JSON

Do you love working with S-Expressions? Me either. Convert your Kicad board
and module files to JSON or YAML and use your favorite tools to work with
your Kicad board and module file data!

## CLI Usage

When installed globally (`npm i -g kicad-to-json`), npm installs the
`k2j` command line tool, which converts your kicad files to json like so:

```sh
k2j ./my_module_file.kicad_mod
# creates ./my_module_file.json in compact format

k2j ./my_board_file.kicad_pcb --yaml --format long
# creates ./my_board_file.yaml in long format
```

Use the `-h` flag for the usual help:

```txt
usage: index.js [-h] [-o OUTPUT] [-f {compact,long,bare}] [-v] [--yaml] file

Convert Kicad board and module files to JSON/YAML

positional arguments:
  file                  The Kicad pcb or module file to convert to json

optional arguments:
  -h, --help            show this help message and exit
  -o OUTPUT, --output OUTPUT
                        Output file (defaults to input file with '.json' or '.yaml' extension)
  -f {compact,long,bare}, --format {compact,long,bare}
                        Set the output format
  -v, --verbose         verbose output
  --yaml                set output to yaml
```

## Javascript / Typescript Usage

User friendly data

```ts
import { parse } from "kicad-module-parser"

// convert the module (string) to compact format
const my_module = parse.module(kicad_mod_contents_string)

// convert the board (string) to long format
const my_board = parse.board(kicad_pcb_contents_string,"long")
```

## Output Formats

### Background

The `kicad_mod` and `kicad_pcb` files are S-Expressions based which have
the general format `(name  ...contents )` where the contents are either
individual values or nested s-expressions (e.g. `( pts (xy 1 1) (xy 2 2))`).
Some s-expressions are singletons, such as the `pts` expression within a
`polygon` and others can appear multiple times, such as the individual `xy`
pairs within an array of points.

### `bare` Notation

In the `bare` notation the first token in the s-expresion appears as it's `type`
attribute, and the remaining sub-expression appear in the `value` attribute.
This format is quite literal, but generally hard to work with.  Here is a brief
example (in yaml format):

```yaml
type: kicad_pcb
value:
  - type: version
    value:
      type: number
      value: '20171130'
  - type: general
    value:
      - type: thickness
        value:
          type: number
          value: '1.6'
      - type: drawings
        value:
          type: number
          value: '605'
      - type: tracks
        value:
          type: number
          value: '2555'
      - type: zones
        value:
          type: number
          value: '0'
      - type: modules
        value:
          type: number
          value: '172'
```

### `compact` Notation

In the compact format, s-expression types and values from the bare format are
used as key-value pairs of a JSON object This works for s-expressions that are
singletons, but for expressions like `(add_net GND) (add_net +3v3)` which may
appear multiple times within the parent s-expression, the contents of the
expression are included in an array of the same name, such as :

```json
{
    "add_net":[
        {"net_name": "GND"},
        {"net_name": "+3v3"}
    ]
}
```

Here is the same example from above in compact format:

```yaml
kicad_pcb:
  version: 20171130
  general:
    thickness: 1.6
    drawings: 605
    tracks: 2555
    zones: 0
    modules: 172
    nets: 143
```

### `long` Notation

The `long` format is a hybrid between the Compact and Bare formats, and
recoginses that module and board files are special, in that nearly every file
will have *many* repeating entities (such as `gr_lines`) where preserving the
order of the entites may be useful.  Hence, the immediate children of boards and
modules (and modules nested within boards) are represent in bare format, and
everything else is represented in compact format. Here is the same example from
above in long format:

```yaml
kicad_pcb:
  - type: version
    value: 20171130
  - type: general
    value:
      thickness: 1.6
      drawings: 605
      tracks: 2555
      zones: 0
      modules: 172
      nets: 143
```

## `bare` Format Details

There are 4 primitives in the bare format which have type `"string"`, `"hex"`,
`"number"` and `"boolean"`, such as:

```json
{ "type": "string", "value": "GND" }
{ "type": "hex", "value": "1234ABCD" }
{ "type": "number", "value": "3.2" } // yes, numbers are represented as strings
{ "type": "boolean", "value": true }
```

The array type has a `type` attribute of `"array"` and a `value` contianing an
aray of primitives, such as:

```json
{ "type": "array", "value": [ { "type": "string", "value": "GND" } ] }
```

The `container` type is like the `array` type but it's `type` attribute has a
value other than `"string"`, `"hex"`, `"number"`, `"boolean"` or `"array"`, and
the value can contain any type (including other containers), or an array
containing any of the types, sucy as:

```json
{
  "type": "xy",
  "value": [
    {
      "type": "x",
      "value": {
        "type": "number",
        "value": "117.4"
      }
    },
    {
      "type": "y",
      "value": {
        "type": "number",
        "value": "28"
      }
    }
  ]
}
```

## Final notes

There are a handfule of sub-parsers and things I was not personally
interested in (such as page formatting) which result in a value like
`"page info": "unsupported"`. If you despirately need page info (or any other
unsupported features), I welcome your pull request!

If your board or module results in an error, please put it in a github repo (or
a minimal example that raises the same error), and open an issue with a link to
that github repo.
