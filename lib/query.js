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
const Query = (value, root, results) => new Proxy(
    () => {},
    {
        apply(_0, _1, args) {
            const [t] = args

            const next =
                (typeof t === "function")
                ? t(value)
                : getProp(value, t.split("."))
            return Query(next, root, results)
        },
        get(_0, name) {
            const top = Query(root, root, results)
            const { line } = location()
            if (qfn.hasOwnProperty(name) === false) {
                return () => {
                    results.fail.push(
                        `@${line}: ${name} is not a valid assertion`
                    )
                    return top
                }
            }

            return (options) => {
                const passed = qfn[name](value, options)

                if (passed === true) {
                    results.pass += 1
                    return top
                }

                const given = JSON.stringify(value)
                const target = JSON.stringify(options)
                results.fail.push(
                    `@${line}: ${name} ${given} expected, was ${target}`
                )

                return top
            }
        }
    }
)

module.exports = Query
