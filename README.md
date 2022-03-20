# Aegis
Test runner for NodeJS (and browsers soon)

## Installation
Normal npm/yarn stuff

## API

### `package.json` Usage
> For running files that use es6 moduler syntax or commonjs
> only works in node 12+
> `aegis <glob pattern> [hooks file]`

> For running files that don't use e6 module syuntax
> works in node <12
> `aegis-cjs <glob pattern> [hooks file]`
```json
{
    ...,
    "scripts": {
        "test-modules-only": "aegis test/**/*.test.mjs",
        "test-cjs-only": "aegis-cjs test/**/*.test.js",
        "test-all": "aegis \"test/**/*.test.{js,mjs}\" test/hooks.js"
    },
    ...
}
```

### Hooks

```js
//  setup is run before all tests begin and is given an object that is shared
//  between all test runs, and sent to the teardown hook at the end.
exports.setup = function(shared) {
    console.log("Running tests")
    console.log("=".repeat(60))
}

//  beforeFile/afterFile are called before and after a file's test has been
//  run, after the file's test has been loaded.
exports.beforeFile = function(filename) {
    console.log("running", filename)
}

exports.afterFile = function(filename) {
}

//  teardown is run after all tests have completed, but before the results
//  have been reported. Should be used to cleanup resources that were shared
//  from setup.
exports.teardown = function(shared) {
    console.log("=".repeat(60))
}
```
