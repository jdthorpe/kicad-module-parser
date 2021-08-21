# testing

```sh
npm test
# or
node test/
```

## Initialization

```sh
pushd data/module
./init.sh
popd
pushd data/pcb
./init.sh
popd
```

## Clean Up

```sh
find ./data -name "*.json" -delete
```
