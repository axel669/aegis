const valueCache = new Map()
export const generateValue = async (f) => {
    if (valueCache.has(f) === true) {
        return valueCache.get(f)
    }
    try {
        const value = { value: await f() }
        valueCache.set(f, value)
        return value
    }
    catch (error) {
        const errValue = { error }
        valueCache.set(f, errValue)
        return errValue
    }
}
export const getPropValue = (source, key) => {
    if (source.value === null || source.value === undefined) {
        return { value: undefined }
    }
    if (typeof key === "function") {
        try {
            return { value: key(source.value) }
        }
        catch (error) {
            return { error }
        }
    }
    return { value: source.value[key] }
}

const status = {
    pass: "pass",
    fail: "fail"
}
export const runCheck = (runArgs) => {
    const {
        value,
        type,
        check,
        args,
        name,
        line,
    } = runArgs
    if (value.hasOwnProperty(type) === false) {
        const got = Object.keys(value)[0]
        return {
            status: status.fail,
            message: `@${line} - expected to test ${type} but got ${got}`,
            value: value[type],
            report: [],
        }
    }
    const pass = check(value[type], ...args)
    if (pass === false) {
        return {
            status: status.fail,
            message: `@${line} - failed check`,
            value: value[type],
            name,
            args,
            report: [
                value[type],
                name,
                (args.length === 1) ? args[0] : args
            ]
        }
    }
    return {
        status: status.pass,
        message: "Check passed",
        report: []
    }
}
