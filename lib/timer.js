export default () => {
    let last = 0
    return {
        tick() {
            const now = performance.now()
            const duration = now - last
            last = now
            return duration
        }
    }
}
