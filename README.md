# Aegis
Simple and fast test runner for Node.

## TODO
- Add config for exiting the test process early on certain kinds of failures
- Allow running subset of tests within files somehow
    - Add an export to skip a specific file maybe?
- Maybe some default log reporting?
- Add back in the cli error codes at some point once the internals are better
    decided around certain failures

## Notes from prev version
- setup/teardown hooks are gone because you can just add files in the files
    section to run before and after all the tests.

## Installation

### CLI
```bash
pnpm add @axel669/aegis
```

## Usage
Aegis determines at import time if it should use the node or browser version.
This means that all import names are the same and use the same library name
between both envs, so that you dont have to think about where it runs, just
what it runs.

### CLI
```bash
npx aegis -c [config-file]
```

<!-- The CLI command uses unique non-0 error codes when the test suite fails, with
each error code representing a different condition for failure. This means that
a command line script can react to the process results regardless of how the
reporting is setup (no special type of output needed to know what happened).

#### Process Return Codes
```
0 - NO_ERROR
1 - SUITE_FAILED
2 - TEST_HAD_ERROR
3 - CHECK_HAD_ERROR
5 - SECTION_FAILED
6 - COLLECTION_FAILED
``` -->

### packge.json
```json
{
    ...,
    "scripts": {
        ...,
        "test": "aegis -c test/aegis.config.js"
    },
    ...
}
```

### Config File Format
The config file can have any name, as long as it's a js file that has "config"
as a named export.
```js
// An array of strings that are file globs.
// If globs share file matches, the file is only run once at the first glob
// that matched it. Files starting with "setup:" will be run as scripts that
// run code for managing global state, and will be reported as such. Any tests
// defined in them will not be run, but any aegis.setup calls will be. Entries
// defined this way will be treated as single files, not as file globs.
// This example would run load-things.js file first, then the first.test.js file
// before all other test files, because the first.test.js was matched in an
// earlier glob, before it was found in test/**/*.test.js.
export const files = [
    "setup:test/load-things.js",
    "test/first.test.js",
    "test/**/*.test.js"
]
// Every hook is optional, and Aegis has its own versions of the hooks
// internally that will be run for any that are not provided. The default Aegis
// hook is also passed into custom hooks, so the original behavior can be called
// in addition to any custom behavior.
export const hooks = {
    // Runs when a file gets loaded
    "file.start": (fileInfo, defaultHook) => {}
    // Runs after all tests in a file are complete
    "file.end": (fileResults, defaultHook) => {}

    // Runs when right before a test is run
    "test.start": (testConfig, defaultHook) => {}
    // Runs after a test finishes
    "test.end": (testResults, defaultHook) => {}

    // Runs after all tests are finished and after all files have been handled
    "done": (results, defaultHook) => {}
}

// Set this to have a max timeout on any test that doesn't specify it's own
// timeout. Default is 30s.
export const timeout = 30_000

// If true, then console.log statements that are in the test files will be
// shown in the console while the tests are running. If false, the logs will
// not be shown during the runtime. Regardless of the value, all the logs are
// available in arrays in the results objects.
export const logOutput = true
```

**Data Format**
```ts
type Results = {
    totalTime: number
    runtime: number
    load: number
    count: {
        pass: int
        fail: int
        total: int
    }
    results: Array<{
        // FileInfo
        name: string
        path: string
        // FileResult
        logs: Array<string>
        tests: Array<{
            // TestInfo
            setup: bool
            name: string
            // TestResults
            logs: Array<string>
            count: {
                pass: int
                fail: int
                total: int
            }
            runtime: number
            results: Array<{
                name: string
                count: {
                    pass: int
                    fail: int
                    total: int
                }
                results: Array<{
                    pass: boolean
                    name: string
                    line: int
                    message: string?
                }>
            }>
        }>
    }>
}
```

## API

### `aegis.setup`
Defines a function in the test suite that does not have checks. Has access to
the fileState like a test, so can be used to setup file state for tests to use.

### `aegis.test`
Defines a test that can have any number of checks. Tests are executed in the
order they are defined in the file, but Aegis handles running the actual
functions. Code outside of test/setup functions will always run before any setup
or test functions are, even if the code appears between test declarations.

### `$.check`
Collects a series of checks under a name so that it can be reported out nicely.

### `$.<assertion>`
Runs an assertion using the arguments provided. If the name of the assertion
ends with `Async` the assertion must be awaited or it will not be processed
correctly. Below is a list of assertions that Aegis has built in, and the
section after that will explain how to add custom assertions.

Value assertions take a value and check against the value provided. Function
assertions take a function, call the function, and then are checked against
the result of that call. If the async version of an assertion is used, it will
await the value or await the function call as needed. Function assertions are
wrapped in a Result object that has the following properties:

```js
// If the function does not throw
type Result = {
    ok: true
    // the return value of the function
    value: any
}
// If the function does throw
type Result = {
    ok: false
    // the error that was thrown, unmodified
    error: Error
}
```

- For values
    - eq(value, target)
    - neq(value, target)
    - lt(value, target)
    - gt(value, target)
    - lte(value, target)
    - gte(value, target)
    - between(value, low, high)
    - in(value, low, high)
    - near(value, target, delta)
    - isnan(value)
    - isfinite(value)
    - includes(value, target)
    - contains(value, target)
    - has(value, target)
    - hasProp(value, propName)
    - typeof(value, type)
    - instanceof(value, objectType)
- For functions
    - throws(func)

### aegis.createAssertion
Creates a custom assertion function that can be used in any test after it is
defined. Async versions of assertions are created automatically and do not need
to be made separately.

```js
aegis.createAssertion({
    // assertion name
    name: "squared",
    // assertion type: value or func
    type: "value",
    // the code that is run for the assertion
    run: (target, sq) => (target ** 2) === sq,
    // optional function that formats failure messages
    error: (target, sq) => `${sq} is not the square of ${target}`,
})
```

## Test File Format
Test files should contain one or more tests (and the default reporting will warn
if no tests are defined in a file). Any code can be run before the tests are
run, doing any setup necessary. All code runs in aa separate thread from the
main thread, but all tests are run in the same thread, so using the fileState
and globalState to share data does not need to worry about cross-thread
serialization to work.

A test file can export a `name` that will be used in the reporting of the
results from the test within the file.

#### Example Test
```js
import { Collection, $check, $ } from "@axel669/aegis"

const rand = () => Math.random() * 10
import { aegis, $ } from "@axel669/aegis"

const rand = () => Math.random() * 10

const n = rand()

export const name = "Random Number Testing"
aegis.test`Creates Correct Range`(
    () => {
        $.check`number is in correct range`(
            $.within(n, 0, 10)
        )
        $.check`type is correct`(
            $.typeof(n, "number"),
            $.instanceof(n, Number)
        )
    }
)
```
