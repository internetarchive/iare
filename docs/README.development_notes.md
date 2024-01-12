# IIARE Development Notes

This project uses the React.js framework.

## Flock concept

### Filtering Technique

filterFunction for references must pass a ```urlDict``` parameter
so that comparisons can be made with the full url object associated
with urls that may be encountered while filtering.

We do this by calling the filter function with ```.bind```, as seen in the 
RefFlock component when filtering references.

Note also the "self calling function" technique when the filter function is called:

```
const filteredRefs = refFilter
        ? refArray.filter((refFilter.filterFunction)().bind(null, pageData.urlDict), )
        : refArray;
```
Correspondingly, when the filter function is defined, as, for example in
```UrlDisplay``` component, it must accommodate the urlDict param. Also,
note that the filter function definition is a "function defining function": note the
empty argument, followed by a typical callback function definition.
```
filterFunction: () => (urlDict, ref) => {
    if (!templateName?.length) return true  // always let reference through if templateName is empty
    if (!ref.template_names) return false  // if ref does not have template_mames property...
    return ref.template_names.includes(templateName)  // return true of templateName represented
},
```
