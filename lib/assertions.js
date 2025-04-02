export const checkFunction = {
}
const addProxy = (type) => new Proxy(
    {},
    {
        get(_, name) {
            return (check) => {
                checkFunction[name] = { type, check }
            }
        }
    }
)
export const addCheck = {
    value: addProxy("value"),
    error: addProxy("error"),
}
addCheck.value.eq(
    (value, target) => value === target
)
addCheck.value.neq(
    (value, compare) => value !== compare
)
addCheck.value.lt(
    (value, compare) => value < compare
)
addCheck.value.gt(
    (value, compare) => value > compare
)
addCheck.value.lte(
    (value, compare) => value <= compare
)
addCheck.value.gte(
    (value, compare) => value >= compare
)
addCheck.value.between(
    (value, lower, higher) => (
        value >= lower
        && value <= higher
    )
)
addCheck.value.near(
    (value, { target, delta }) => Math.abs(target - value) < delta
)
addCheck.value.isnan(
    (value, compare) => isNaN(value) === compare
)
addCheck.value.isfinite(
    (value, compare) => isFinite(value) === compare
)
addCheck.value.includes(
    (value, target) => value.includes(target)
)
addCheck.value.has(
    (value, property) => value.hasOwnProperty(property)
)
addCheck.error.throws(
    (error, message, type) => (
        error.message === message
        && (error instanceof type)
    )
)
