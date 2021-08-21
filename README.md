# Convert Kicad Board and Module files to JSON

Do you love working with S-Expressions? Me either. Convert your Kicad board
and module files to JSON or YAML and use your favorite tools to work with
your Kicad board and module file data!

## CLI Usage

When installed globally (`npm i -g kicad-module-parser`), npm installs the
`k2j` command line tool, which converts your kicad files to json like so:

```sh
k2j -f ./my_module_file.kicad_mod
# creates ./my_module_file.json

k2j -f ./my_board_file.kicad_pcb
# creates ./my_board_file.json
```

Use the `-h` flag for the usual help:

```txt
usage: k2j [-h] -f FILE [-o OUTPUT] [-v] [--yaml]

Convert Kicad board and pcb files to JSON/YAML

optional arguments:
  -h, --help            show this help message and exit
  -f FILE, --file FILE  The Kicad pcb or module file to convert to json
  -o OUTPUT, --output OUTPUT
                        Output file (defaults to input file with '.json' or '.yaml' extension)
  -v, --verbose         verbose output
  --yaml                set output to yaml`
```

## Javascript / Typescript Usage

User friendly data

```ts
import { parse } from "kicad-module-parser"
parse.module(some_kicad_module)
parse.board(some_kicad_board)
```

## About the output

`kicad_mod` and `kicad_pcb` files are S-Expressions, which, simply put, are
not JSON. Converting them to JSON therefore requires taking an opion on how
to do the conversion. This is a brief explanation of the opinions expressed
in this module.

Wihtin the Kicad Module and Board files, s-expressions start with a token
such as `( kicad_mod ... )` or `(xyz 1 2 3)`, which this module uses as keys
in a JSON object such as `{"kicad_mod": ...}` or `{"xyz": ... }`. This works
for s-expressions that are singletons, but for expressions like `(add_net
GND) (add_net +3v3)` which may appear multiple times within the parent
s-expression, the contents of the expression are included in an array of the
same name, such as :

```json
{
    "add_net":[
        {"net_name": "GND"},
        {"net_name": "+3v3"}
    ]
}
```

Some s-expression have children (other than the name of the s-expression)
which are simple tokens such as strings, net names, and numbers. Names for
these variables are generally taken from the cpp parsers or from obvious
neumonics. For example, `(xy 1.1 2.2)` becomes `{"xy":{"x":1.1, "y":2.2}}`.

Finally, There are a handfule of sub-parsers and thing I was not personally
interested in (such as page formatting) which result in a value like
`"page info": "unsupported"`. If you despirately need page info (or any other
unsupported features), I welcome your pull request!
