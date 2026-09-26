import { aegis, $ } from "@axel669/aegis"

const rand = () => Math.random() * 10

const n = rand()

aegis.test`Creates Correct Range`(
    () => {
        $.check`number is in correct range`(
            $.within(n, 0, 10)
        )
        $.check`type is correct`(
            $.typeof(n, "number"),
            $.instanceof(n, Number)
        )
    }
)
