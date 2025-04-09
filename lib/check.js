import { $, stepsKey } from "./access-proxy.js"
import { checkFunction } from "./assertions.js"
import { syncCall, asyncCall, runCheck, getPropValue } from "./evaluate.js"

const parseLine = (err) => {
    const stack = err.stack
    const lines = [...stack.matchAll(/(@|at).*:(\d+):(\d+)/g)]
    return parseInt(lines[1][2])
}
export const $$check = {
    list: []
}
const checker = (gen, label) => {
    const coreValue = syncCall(gen)
    let realFakePromise = []
    const proxy = new Proxy(
        {},
        {
            get(_target, name) {
                if (name === "then") {
                    return (next) => Promise.all(realFakePromise).then(next)
                }
                if (checkFunction[name] === undefined) {
                    throw new Error(`"${name}" is not a configured check`)
                }
                return (access = $, ...args) => {
                    const line = parseLine(new Error(""))
                    const path = access[stepsKey]
                    realFakePromise.push(
                        new Promise(
                            async (resolve) => {
                                const baseValue =
                                    (coreValue.value instanceof Promise)
                                    ? await asyncCall(() => coreValue.value)
                                    : coreValue
                                const checkedValue = path.reduce(
                                    (current, step) => getPropValue(current, step),
                                    baseValue
                                )
                                const { type, check } = checkFunction[name]
                                const runArgs = {
                                    value: checkedValue,
                                    type,
                                    check,
                                    args,
                                    name,
                                    line,
                                    label
                                }
                                const callResult = syncCall(runCheck, runArgs)
                                callResult.label = label
                                $$check.list.push(callResult)
                                resolve(null)
                            }
                        )
                    )
                    return proxy
                }
            }
        }
    )
    return proxy
}

export const $check = ([label]) => ({
    value: (value) => checker(() => value, label),
    call: (func, ...args) => checker(() => func(...args), label)
})
