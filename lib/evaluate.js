export const asyncCall = async (f, ...args) => {
    try {
        return { value: await f(...args) }
    }
    catch (error) {
        return { error }
    }
}
export const syncCall = (f, ...args) => {
    try {
        return { value: f(...args) }
    }
    catch (error) {
        return { error }
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
        label,
    } = runArgs
    if (value.hasOwnProperty(type) === false) {
        const got = Object.keys(value)[0]
        return {
            status: status.fail,
            message: `@${line} - expected to test ${type} but got ${got}`,
            value: value[type],
            report: [value],
            label,
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
            label,
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
        report: [],
        label,
    }
}
