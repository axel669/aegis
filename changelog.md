## 0.3.1
- _bugfix_ condition and report for failAction = "afterCollection"
- _add_ type garnish for LSPs
- _change_ clearer and more descriptive readme docs

## 0.3.0
- massive rewrite of internals

## 0.2.7
- changed failed assertion output to handle larger objects when using with
    other frameworks for performing test validation

## 0.2.6
- errors throw in assertion value functions are now reported and don't stop
    (believin') the entire suite from continuing
- test report includes total of all assertions across all files
- Section function can now look cooler with tagged template string suport
- processes will now have exit 1 if any assertions fail

## pre-0.2.6
I couldn't be bothered to document changes better before 0.2.6
