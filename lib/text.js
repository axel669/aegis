const reset = "\x1b[0m"
const colors = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    lightgreen: "\x1b[92m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
}
export const color = Object.fromEntries(
    Object.entries(colors).map(
        ([name, code]) => [
            name,
            (str) => `${code}${str}${reset}`
        ]
    )
)
