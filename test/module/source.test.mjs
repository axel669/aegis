import source from "../source.js"

export function test(Result) {
    const test = Math.random()

    console.log(source)
    console.log(Result(source))
    console.log(Result(test))
}
