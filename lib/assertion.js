export const handlers = {}
const types = ["value", "func"]
export const createAssertion = (config) => {
    if (types.includes(config?.type) === false) {
        throw new Error(`Invalid handler type: ${config?.type}`)
    }
    handlers[config.name] = config
}

const stringifyArgs = (args) => Object.fromEntries(
    Object.entries(args).map(
        pair => [
            pair[0],
            JSON.stringify(pair[1])
        ]
    )
)
createAssertion({
    name: "eq",
    type: "value",
    run: (value, target) => value === target,
    error: (value, target) => {
        const s = stringifyArgs({ value, target })
        return `Expected ${s.target} got ${s.value}`
    }
})
createAssertion({
    name: "neq",
    type: "value",
    run: (value, target) => value === target,
    error: (value, target) => {
        const s = stringifyArgs({ value, target })
        return `Expected not ${s.target} got ${s.value}`
    }
})
createAssertion({
    name: "lt",
    type: "value",
    run: (value, target) => value < target,
    error: (value, target) => {
        const s = stringifyArgs({ value, target })
        return `${s.target} is not less than ${s.value}`
    }
})
createAssertion({
    name: "gt",
    type: "value",
    run: (value, target) => value > target,
    error: (value, target) => {
        const s = stringifyArgs({ value, target })
        return `${s.target} is not greater than ${s.value}`
    }
})
createAssertion({
    name: "lte",
    type: "value",
    run: (value, target) => value <= target,
    error: (value, target) => {
        const s = stringifyArgs({ value, target })
        return `${s.target} is not less than (or equal to) ${s.value}`
    }
})
createAssertion({
    name: "gte",
    type: "value",
    run: (value, target) => value >= target,
    error: (value, target) => {
        const s = stringifyArgs({ value, target })
        return `${s.target} is not greater than (or equal to) ${s.value}`
    }
})
createAssertion({
    name: "between",
    type: "value",
    run: (target, lower, upper) => (
        target > lower
        && target < upper
    ),
    error: (target, lower, upper) => {
        const s = stringifyArgs({ value, lower, upper })
        return `${s.target} is not between ${s.lower} and ${s.upper}`
    }
})
createAssertion({
    name: "within",
    type: "value",
    run: (target, lower, upper) => (
        target >= lower
        && target <= upper
    ),
    error: (target, lower, upper) => {
        const s = stringifyArgs({ value, lower, upper })
        return `${s.target} is not within ${s.lower} and ${s.upper}`
    }
})
createAssertion({
    name: "near",
    type: "value",
    run: (target, value, delta) => (
        Math.abs(target - value) < delta
    ),
    error: (target, value, delta) => {
        const s = stringifyArgs({ target, value, delta })
        return `${s.target} is not within ${s.delta} of ${s.value}`
    }
})
createAssertion({
    name: "isnan",
    type: "value",
    run: (target) => isNaN(target) === true,
    error: (target) => `${JSON.stringify(target)} is a number`
})
createAssertion({
    name: "isFinite",
    type: "value",
    run: (target) => isFinite(target) === true,
    error: (target) => `${JSON.stringify(target)} is not finite`
})
createAssertion({
    name: "includes",
    type: "value",
    run: (target, value) => target?.includes?.(value) === true,
    error: (target, value) => {
        const s = stringifyArgs({ target, value })
        return `${s.target} does not include ${s.value}`
    }
})
createAssertion({
    name: "contains",
    type: "value",
    run: (target, value) => target?.contains?.(value) === true,
    error: (target, value) => {
        const s = stringifyArgs({ target, value })
        return `${s.target} does not contain ${s.value}`
    }
})
createAssertion({
    name: "has",
    type: "value",
    run: (target, value) => target?.has?.(value) === true,
    error: (target, value) => {
        const s = stringifyArgs({ target, value })
        return `${s.target} does not have ${s.value}`
    }
})
createAssertion({
    name: "hasProp",
    type: "value",
    run: (target, key) => target?.hasOwnProperty(key) === true,
    error: (target, key) => {
        const s = stringifyArgs({ target, key })
        return `${s.target} does not have prop ${s.key}`
    }
})
createAssertion({
    name: "typeof",
    type: "value",
    run: (target, type) => (typeof target) === type,
    error: (target, type) => {
        const s = stringifyArgs({ target, type })
        return `${s.target} is not type ${s.type}`
    }
})
createAssertion({
    name: "instanceof",
    type: "value",
    run: (target, type) => Object(target) instanceof type,
    error: (target, type) => {
        return `Value is not an instance of ${type.name ?? type.toString()}`
    }
})
createAssertion({
    name: "throws",
    type: "func",
    run: (res) => {
        return (res.ok === false)
    },
})

// export const checkFunction = {}
// const addProxy = (type) => new Proxy(
//     {},
//     {
//         get(_, name) {
//             return (check) => {
//                 checkFunction[name] = { type, check }
//             }
//         }
//     }
// )
// export const addCheck = {
//     /** @type {{[name: string]: (check: (...args: any[]) => bool) => void}} */
//     value: addProxy("value"),
//     /** @type {{[name: string]: (check: (...args: any[]) => bool) => void}} */
//     error: addProxy("error"),
// }
// addCheck.value.eq(
//     (value, target) => value === target
// )
// addCheck.value.neq(
//     (value, compare) => value !== compare
// )
// addCheck.value.lt(
//     (value, compare) => value < compare
// )
// addCheck.value.gt(
//     (value, compare) => value > compare
// )
// addCheck.value.lte(
//     (value, compare) => value <= compare
// )
// addCheck.value.gte(
//     (value, compare) => value >= compare
// )
// addCheck.value.between(
//     (value, lower, higher) => (
//         value > lower
//         && value < higher
//     )
// )
// addCheck.value.in(
//     (value, lower, higher) => (
//         value >= lower
//         && value <= higher
//     )
// )
// addCheck.value.near(
//     (value, target, delta) => Math.abs(target - value) < delta
// )
// addCheck.value.isnan(
//     (value) => isNaN(value) === true
// )
// addCheck.value.isfinite(
//     (value) => isFinite(value) === true
// )
// addCheck.value.includes(
//     (value, target) => value.includes(target)
// )
// addCheck.value.contains(
//     (value, target) => value.contains(target)
// )
// addCheck.value.has(
//     (value, target) => value.has(target)
// )
// addCheck.value.hasProp(
//     (value, property) => value.hasOwnProperty(property)
// )
// addCheck.value.typeof(
//     (value, type) => (typeof value) === type
// )
// addCheck.value.instanceof(
//     (value, type) => Object(value) instanceof type
// )
// addCheck.error.throws(
//     (error, message = null, type = null) => {
//         if (null !== message && message !== error.message) {
//             return false
//         }
//         if (null !== type && false === (error instanceof type)) {
//             return false
//         }
//         return true
//     }
// )
