# Aegis
Test runner for NodeJS (and browsers soon)

## Installation
```bash
yarn add @axel669/aegis
```

## API

### Test Files
```js
//  Import whatever resources needed, the glob automatically ignores
//  node_modules folders.
import fetch from "node-fetch"

import source from "../source.js"

//  Export a "test" function from each file to be run, optionally async.
//  First argument is an object that contains an Assert and Section function.
//  Second argument is an object that is shared between every test function and
//  and can be modified by the hook functions described later.
export async function test({Assert, Section}, shared) {
    const test = Math.random()
    const obj = { test }
    const list = [1, 2, 3, 4]

    //  Mark sections for the report to group results in.
    Section("modules pls work")

    //  Assertions can be chained, see next section for details.
    Assert(obj)
        `test`.gt(0)
        `test`.lt(1)
    Assert(source)
        .neq(null)

    //  A file can have as many section as it wants, but sections cannot
    //  be nested.
    Section("cool stuff")

    Assert(list)
        .includes(3)
        .contains(3)
        ("length").eq(10)

    Section("postman echo")
    const res = await fetch("https://postman-echo.com/get")
    const result = await res.json()

    Assert(result)
        .has("args")
        ("args")(Object.keys)("length").eq(0)
}
```

### Assert
The assert function takes a single argument with the value to use for the
checks that follow. It returns an object that can either be called as a function
or have comparison functions called.

```js
//  value to use for ops
Assert(100)
    //  check if the value is equal to something else
    .eq(100)

Assert({ a: 10, b: 12.5 })
    //  calling the result as a function will get the named value
    //  comparison functions can be called on the resulting value, and the
    //  chain will go back to the original value for the next calls
    ("a").eq(10)
    //  the chainable function can also be used with tagged template literals
    //  as a shorthand for property access
    `b`.near({ target: 12.5, delta: 0.01 })
    .has("a")

Assert({ first: 0, second: 1, third: 2 })
    //  passing a function instead of a string will call the function and pass
    //  the value as the only argument, and use the result for the next part
    //  of the chain
    (Object.keys)`length`.eq(3)
    (Object.values).includes(0)
```

#### Built-in Assertions
- eq
- neq
- lt
- gt
- lte
- gte
- near
- isnan
- isfinite
- includes
- has

### `package.json` Usage
> For running files that use es6 moduler syntax or commonjs
> only works in node 12+
> `aegis <glob pattern> [hooks file]`

> For running files that don't use e6 module syntax
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
