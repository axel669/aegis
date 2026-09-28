# Aegis
Simple and fast test runner for Node.

## TODO
- Add config for exiting the test process early on certain kinds of failures
- Maybe some default log reporting?

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
// that matched it.
// This example would run the first.test.js file before all other test files
// which is great if you want to run a setup file, or even inject setups
// between bunches of tests, or if you want to run code after all tests.
export const files = [
    "test/first.test.js",
    "test/**/*.test.js"
]
// Every hook is optional, and Aegis has its own versions of the hooks
// internally that will be run for any that are not provided.
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
    }>
}
```

#### suiteResults
The suiteResults is one of these objects based on the settings and test results.
```js
// a test had an uncaught error
TestIssue = {
    type: "test-error"
    error: Error
}
// a check function threw an error
CheckIssue = {
    type: "check-error"
    errors[]: {
        error: Error
    }
}
// a section had a failure and failAction === "afterSection"
SectionFail = {
    type: "section-fail"
    section: SectionResult
}
// a collection had a failure and failAction === "afterCollection"
CollectionFail = {
    type: "collection-fail"
    collection: CollectionResult
}
// all tests passed or failAction === "ignore"
SuiteResult = {
    type: "complete";
    results[]: CollectionResult
    runTime: number
    checks[]: CheckResult
    pass[]: CheckResult
    fail[]: CheckResult
    loadTime: number
}

// supplementary types
CollectionResult = {
    info: {
        name: string
        file: string
    }
    sections[]: SectionResult
    runTime: number
    checks[]: CheckResult
    pass[]: CheckResult
    fail[]: CheckResult
    loadTime: number
}
SectionResult = {
    info: {
        name: string
        collection: CollectionResult
    }
    labels[]: LabelResult
    runTime: number
    checks[]: CheckResult
    pass[]: CheckResult
    fail[]: CheckResult
}
LabelResult = {
    label: string
    checks[]: CheckResult
    pass[]: CheckResult
    fail[]: CheckResult
}
CheckResult = PassedCheck | FailedCheck
PassedCheck = {
    status: "pass"
    label: string
}
FailedCheck = {
    status: "fail"
    label: string
    report: string
    message: string
    value: any
    name: string
    args[]: any
}
```

## API

### Collection
Creates a collection of tests to be run. Abuses the tagged template literal
syntax to allow putting a label for the collection inline. Since ES2015 the
order that keys are added to an object determines the order they are given when
iterating, allowing an object with full string keys to be used for ordering the
individual tests as well.

### $check
The structure that allows creating checks for a test. Like the collection, it
allows a label for the check to be added with the tagged template literal
syntax.

The type of check that needs to be run is determined by the first function call
(`.value` of `.call`). Value checks take the value as is (with promises being
awaited as normal), while call checks call the function and then pass the result
into a value check for the user, while also catching errors that can be checked
against. Subsequent functions in the chain add checks to be run. A later section
of this readme lists the built-in checks, and how to add custom checks.

### $
A magic structure that describes what part of a value or call result needs to be
checked. It does not have a value itself, it only creates a chain that is used
internally to retrive values from objects, allowing multiple checks to be done
on different properties of a single object without creating new check labels
for each of them. The examples in the readme and the repo show how it can be
used for any kind of property/function access on an object.

> NOTE: In order to keep the syntax clean and not throw unnecessary errors on
> property access, the chain uses optional chaining at all points.
> `$.a.b() === value?.a?.b?.()`

## Test File Format
Test files should export a single collection (maybe change in the future?).
Collections are run in the order they are found in the blob strings. This means
individual files can be put earlier in the array of globs if you want to run
them before other files.

#### Example Test
```js
import { Collection, $check, $ } from "@axel669/aegis"

const rand = () => Math.random() * 10
export default Collection`Number Generator`({
    // runScope comes from the setup method, and can be modified by any test
    // during the runtime. fileScope is created when the tests in the file are
    // run, and is destroyed once they finish.
    "Creates correct range": ({ runScope, fileScope }) => {
        const n = rand()
        $check`is in range 0 <= n <= 10`
            .value(n)
            .in($, 0, 10)
        runScope.n = n
    },
    // If a test doesn't need the fileScope (or the runScope) it can just ignore
    // that part of the argument
    "Scope Value Example": ({ runScope }) => {
        $check`is a number`
            .value(runScope.n)
            .typeof($, "number")
            .instanceof($, Number)
    }
})
```

### Built-in Checks
Most checks are designed to work on a value (or return from a call), but they
can also be registered to act on the errors thrown by functions. The list below
has all the built in checks for values and errors that are in the library by
default.

- For values
    - eq($, value)
    - neq($, value)
    - lt($, value)
    - gt($, value)
    - lte($, value)
    - gte($, value)
    - between($, low, high)
    - in($, low, high)
    - near($, value, delta)
    - isnan($)
    - isfinite($)
    - includes($, value)
    - contains($, value)
    - has($, value)
    - hasProp($, propName)
    - typeof($, type)
    - instanceof($, objectType)
- For errors
    - throws($[, message[, errorType]])

### Custom Checks
Custom checks can be created and used within test files. The library has an
export that allows creating checks and registering the type of result they are
used for with a simple syntax.

All checks need to be synchronous functions and should return `true` if the
check passes, `false` otherwise.

```js
import { addCheck } from "@axel669/aegis"

// Checks if a value is a square number (doesn't take extra args)
addCheck.value.isSq(
    (value) => {
        const root = Math.sqrt(value)
        const fractional = root % 1
        return fractional === 0
    }
)
// checks if a string is the reverse of a target string
addCheck.value.reverseOf(
    (value, target) => value.split("").reverse().join("") === target
)
```
