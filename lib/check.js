import { stepsKey } from "./access-proxy.js"
import { checkFunction } from "./assertions.js"

const parseLine = (err) => {
    const stack = err.stack
    const lines = [...stack.matchAll(/(@|at).*:(\d+):(\d+)/g)]
    return parseInt(lines[1][2])
}
export const check = {
    list: []
}
const checker = (gen) => {
    const proxy = new Proxy(
        {},
        {
            get(_target, name) {
                if (checkFunction[name] === undefined) {
                    throw new Error(`"${name}" is not a configured check`)
                }
                return (access, ...args) => {
                    const line = parseLine(new Error(""))
                    const path = access[stepsKey]
                    check.list.push({ gen, path, name, args, line })
                    return proxy
                }
            }
        }
    )
    return proxy
}
export const Check = {
    value: (value) => checker(() => value),
    func: (func, ...args) => checker(() => func(...args)),
}
