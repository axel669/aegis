type Expand<T> = {
    [K in keyof T]: T[K]
} & {}

type Optional<T> = {
    [K in keyof T]?: T[K]
} & {}

type Value<T> = Expand<{
    value: T
    error: undefined
}>
type ErrorReturn = Expand<{
    value: undefined
    error: Error
}>
type Maybe<T> = Expand<Value<T> | ErrorReturn>

type TestScope = Expand<{
    runScope: {}
    fileScope: {}
}>

type SyncTest = (context: TestScope) => void
type AsyncTest = (context: TestScope) => Promise<void>

type CollectionConfig = Expand<{
    name: string
    tests: Array<{
        name: string
        run: AsyncTest | SyncTest
    }>
}>

type Hooks = Expand<{
    setup: (ctx: {}) => Promise<void>
    teardown: (ctx: {}) => Promise<void>

    collectionStart: (c: CollectionInfo) => void
    collectionEnd: (c: CollectionResult) => void

    sectionStart: (c: SectionInfo) => void
    sectionEnd: (c: SectionResult) => void
}>

type UserConfiguration = Expand<{
    files: string[]
    hooks?: Optional<Hooks>
    report?: Reporter
    failAction?: "ignore" | "afterCollection" | "afterSection" | null
}>
type FileInfo = Expand<[
    (file: string) => Promise<{ default: CollectionConfig}>,
    string
]>
type TransformedConfiguration = Expand<{
    files: FileInfo[]
    hooks?: Optional<Hooks>
    report?: Reporter
    failAction?: "ignore" | "afterCollection" | "afterSection" | null
}>

type Configuration = Expand<{
    files: FileInfo[]
    hooks: Hooks
    report: Reporter
    failAction: "ignore" | "afterCollection" | "afterSection"
}>

type PassedCheck = Expand<{
    status: "pass"
    label: string
}>
type FailedCheck = Expand<{
    status: "fail"
    label: string
    report: string
    message: string
    value: any
    name: string
    args: Array<any>
}>
type CheckResult = Expand<PassedCheck | FailedCheck>

type ResultSet = Expand<{
    checks: CheckResult[]
    pass: CheckResult[]
    fail: CheckResult[]
}>

type TimedResult = Expand<
    { runTime: number}
    & ResultSet
>

type LoadedResult = Expand<{ loadTime: number}>

type LabelResult = Expand<
    {
        label: string
    }
    & ResultSet
>

type SectionInfo = Expand<{
    name: string
    collection: CollectionResult
}>

type SectionResult = Expand<
    {
        info: SectionInfo
        labels: Array<LabelResult>
    }
    & TimedResult
>

type CollectionInfo = Expand<{
    name: string
    file: string
}>

type CollectionResult = Expand<
    {
        info: CollectionInfo
        sections: SectionResult[]
    }
    & TimedResult
    & LoadedResult
>

type SuiteResult = Expand<
    {
        type: "complete"
        results: CollectionResult[]
    }
    & TimedResult
    & LoadedResult
>

type ExitCodes = Expand<{
    NO_ERROR: 0
    SUITE_FAILED: 1
    TEST_HAD_ERROR: 2
    CHECK_HAD_ERROR: 3
    SECTION_FAILED: 5
    COLLECTION_FAILED: 6
}>

type ExitCode = ExitCodes[keyof ExitCodes]

type TestIssue = Expand<{
    type: "test-error"
    error: Error
}>

type CheckIssue = Expand<{
    type: "check-error"
    errors: { error: Error}[]
}>

type SectionFail = Expand<{
    type: "section-fail"
    section: SectionResult
}>

type CollectionFail = Expand<{
    type: "collection-fail"
    collection: CollectionResult
}>

type TestResult = Expand<
    TestIssue
    | CheckIssue
    | SectionFail
    | CollectionFail
    | SuiteResult
>

type Reporter = (suiteResults: TestResult) => ExitCode

type AccessProxy = {
    [prop: string]: AccessProxy
    (...args: any[]): AccessProxy
}

type ValueCheck = Expand<{
    eq: ($: AccessProxy, ...args: []) => ValueCheck
    neq: ($: AccessProxy, ...args: []) => ValueCheck
    lt: ($: AccessProxy, ...args: []) => ValueCheck
    gt: ($: AccessProxy, ...args: []) => ValueCheck
    lte: ($: AccessProxy, ...args: []) => ValueCheck
    gte: ($: AccessProxy, ...args: []) => ValueCheck
    between: ($: AccessProxy, ...args: []) => ValueCheck
    in: ($: AccessProxy, ...args: []) => ValueCheck
    near: ($: AccessProxy, ...args: []) => ValueCheck
    isnan: ($: AccessProxy, ...args: []) => ValueCheck
    isfinite: ($: AccessProxy, ...args: []) => ValueCheck
    includes: ($: AccessProxy, ...args: []) => ValueCheck
    contains: ($: AccessProxy, ...args: []) => ValueCheck
    has: ($: AccessProxy, ...args: []) => ValueCheck
    hasProp: ($: AccessProxy, ...args: []) => ValueCheck
    throws: ($: AccessProxy, ...args: []) => ValueCheck
} & Promise<void>>
type Check = Expand<{
    value: (value :any) => ValueCheck
    call: (func: Function, ...args: any[]) => ValueCheck
}>

type SuiteRunner = (userConfig: TransformedConfiguration) => ExitCode
type TestRunner = (options: Configuration) => TestResult
type Runner = (config: UserConfiguration) => ExitCode
