const { performance } = require("perf_hooks")

function Timer() {
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

module.exports = Timer
