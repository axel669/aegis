export const stack = () => {
    const items = []
    return {
        get top() {
            if (items.length === 0) {
                throw new Error("Can't get top of empty stack")
            }
            return items[items.length - 1]
        },
        push(item) {
            items.push(item)
        },
        pop() {
            if (items.length === 0) {
                throw new Error("Can't pop empty stack")
            }
            const item = items[items.length - 1]
            items.pop()
            return item
        },
        get size() {
            return items.length
        }
    }
}
export const wait = (time) => new Promise(
    resolve => setTimeout(
        () => resolve(time),
        time
    )
)
