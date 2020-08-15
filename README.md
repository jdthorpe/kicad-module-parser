# A PegJS parser for Kicad Modules

## Usage

User friendly data

```ts
import { parse_module } from "kicad-module-parser"
parse_module(some_kicad_module)
```

The underlying parser

```ts
import { parse } from "kicad-module-parser"
parse(some_kicad_module)
```

## Testing

```sh
# install dev depenencies
yarn

# create the data directory
mkdir data
pushd data

# clone your favorite Kicad Libraries into the data directory
git clone  https://github.com/Digi-Key/digikey-kicad-library.git
git clone  https://github.com/KiCad/kicad-footprints.git
popd

# parse all the modules and error out if one of them fails to parse
node test.js
```