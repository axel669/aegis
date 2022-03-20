const qfn = {
    eq: (value, compare) => value === compare,
    ne: (value, compare) => value !== compare,
    lt: (value, compare) => value < compare,
    gt: (value, compare) => value > compare,
    lte: (value, compare) => value <= compare,
    gte: (value, compare) => value >= compare,
    near: (value, {target, delta}) => Math.abs(target - value) < delta,
    isnan: (value, compare) => isNaN(value) === compare,
    isfinite: (value, compare) => isFinite(value) === compare,
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

function Query(value, query, location) {
    const failed = Object.entries(query).reduce(
        (failed, [name, compare]) => {
            const [prop, func] = name.split(":")
            const path = prop.split(".").filter(p => p !== "")
            const target = getProp(value, path)
            const result = qfn[func](target, compare)

            if (result === true) {
                return failed
            }
            return [
                ...failed,
                {target, name, compare}
            ]
        },
        []
    )
    const pass = failed.length === 0
    return {location, failed, pass}
}

module.exports = Query
