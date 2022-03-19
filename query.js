const qfn = {
    eq: (value, compare) => value === compare,
    lt: (value, compare) => value < compare,
    gt: (value, compare) => value > compare,
    lte: (value, compare) => value <= compare,
    gte: (value, compare) => value >= compare,
    near: (value, {target, delta}) => Math.abs(target - value) < delta,
    isnan: (value, compare) => isNaN(value) === compare,
    isfinite: (value, compare) => isFinite(value) === compare,
}

function query(value, query) {
    for (const [name, compare] of Object.entries(query)) {
        if (qfn[name](value, compare) === false) {
            return {value, name, compare}
        }
    }
    return true
}

module.exports = query
