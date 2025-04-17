export const stepsKey = Symbol("steps key")
const proxyBaseValue = () => { }
const accessProxy = (steps) => new Proxy(
    proxyBaseValue,
    {
        get(_target, name) {
            if (name === stepsKey) {
                return steps
            }
            return accessProxy([...steps, name])
        },
        apply(_target, _this, args) {
            const name = steps[steps.length - 1]
            return accessProxy([
                ...steps.slice(0, -1),
                (item) => item[name](...args)
            ])
        }
    }
)
/** @type {AccessProxy} */
export const $ = accessProxy([])
