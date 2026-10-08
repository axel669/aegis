const reset = "\x1b[0m"
const colorCodes = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    lightgreen: "\x1b[92m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",

    gray: "\x1b[90m",
    red2: "\x1b[91m",
    green2: "\x1b[92m",
    lightgreen2: "\x1b[92m",
    yellow2: "\x1b[99m",
    blue2: "\x1b[94m",
    magenta2: "\x1b[95m",
    cyan2: "\x1b[96m",
    white2: "\x1b[97m",
}
const bgCodes = {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    lightgreen: "\x1b[92m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",

    gray: "\x1b[100m",
    red2: "\x1b[101m",
    green2: "\x1b[102m",
    lightgreen2: "\x1b[102m",
    yellow2: "\x1b[103m",
    blue2: "\x1b[104m",
    magenta2: "\x1b[105m",
    cyan2: "\x1b[106m",
    white2: "\x1b[107m",
}
export const color = (colors, msg) => {
    const [ textColor, bgColor = null ] = colors
    const text = colorCodes[textColor] ?? ""
    const bg = bgCodes[bgColor] ?? ""
    return `${text}${bg}${msg}${reset}`
}
