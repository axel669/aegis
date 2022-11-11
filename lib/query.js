const assertions = require("./assertions.js")

const qfn = {
    eq: (value, compare) => value === compare,
    neq: (value, compare) => value !== compare,
    lt: (value, compare) => value < compare,
    gt: (value, compare) => value > compare,
    lte: (value, compare) => value <= compare,
    gte: (value, compare) => value >= compare,
    near: (value, {target, delta}) => Math.abs(target - value) < delta,
    isnan: (value, compare) => isNaN(value) === compare,
    isfinite: (value, compare) => isFinite(value) === compare,
    includes: (value, target) => value.includes(target),
    has: (value, property) => value.hasOwnProperty(property),
}

const getProp = (source, path) => {
    if (path.length === 0) {
        return source
    }
    const [prop, ...subProp] = path
    return getProp(
        source[prop],
        subProp
    )
}

const location = () => {
    const err = new Error()
    const callLocation = err.stack.split("\n")[3].slice(0, -1)
    const [line, col] = callLocation.split(":").slice(-2)

    return {line, col}
}
const calculateNext = (source, calc) => {
    if (source[invalid] === true) {
        return source
    }
    if (typeof calc === "function") {
        try {
            return calc(source)
        }
        catch(err) {
            err[invalid] = true
            return err
        }
    }

    const propName = Array.isArray(calc) ? calc[0] : calc
    if (typeof propName !== "string") {
        throw new Error(`Invalid prop name: ${JSON.stringify(propName)}`)
    }

    return getProp(source, propName.split("."))
}
const invalid = Symbol("invalid")
const Query = (value, root, results) => new Proxy(
    () => {},
    {
        apply(_0, _1, args) {
            const next = calculateNext(value, args[0])
            return Query(next, root, results)
        },
        get(_0, name) {
            const top = Query(root, root, results)
            const { line } = location()
            const assertion = qfn[name] ?? assertions[name]
            if (assertion === undefined) {
                return () => {
                    results.fail.push(
                        `@${line}: ${name} is not a valid assertion`
                    )
                    return top
                }
            }

            return (options) => {
                const errored = (
                    value !== undefined
                    && value !== null
                    && value[invalid] === true
                )
                const passed = errored ? false : assertion(value, options)

                if (passed === true) {
                    results.pass += 1
                    return top
                }

                const given = JSON.stringify(value)
                const target = JSON.stringify(options)
                results.fail.push(
                    errored
                    ? value.stack
                    : `@${line}: ${name} ${target} expected, was ${given}`
                )

                return top
            }
        }
    }
)

module.exports = Query
