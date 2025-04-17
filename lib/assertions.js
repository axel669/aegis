export const checkFunction = {}
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
    /** @type {{[name: string]: (check: (...args: any[]) => bool) => void}} */
    value: addProxy("value"),
    /** @type {{[name: string]: (check: (...args: any[]) => bool) => void}} */
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
        value > lower
        && value < higher
    )
)
addCheck.value.in(
    (value, lower, higher) => (
        value >= lower
        && value <= higher
    )
)
addCheck.value.near(
    (value, target, delta) => Math.abs(target - value) < delta
)
addCheck.value.isnan(
    (value) => isNaN(value) === true
)
addCheck.value.isfinite(
    (value) => isFinite(value) === true
)
addCheck.value.includes(
    (value, target) => value.includes(target)
)
addCheck.value.contains(
    (value, target) => value.contains(target)
)
addCheck.value.has(
    (value, target) => value.has(target)
)
addCheck.value.hasProp(
    (value, property) => value.hasOwnProperty(property)
)
addCheck.error.throws(
    (error, message = null, type = null) => {
        if (null !== message && message !== error.message) {
            return false
        }
        if (null !== type && false === (error instanceof type)) {
            return false
        }
        return true
    }
)
