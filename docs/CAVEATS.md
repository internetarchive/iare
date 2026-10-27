i18n is implemented but not fully implemented. However, it is there when ready.

PDF parsing and Grok parsing have been put on hold

The Tapestry parser, parseRefTapestry, is a mirror of another node project. 
- It should not be edited directly in the IARE codebase, but copied from the parseRefTapestry repo.
- it is a separate module so that it can be modified and tested outside the IARI front end
- it can be expanded later to take as input data formats other than iarePageData
- IARE and parseRefTapestry should access a shared pageData data definition



## TODO:
- Client fetching of URL live status should only be dome to URLS that do not have a cached status value 
- analyze fetchPageData and see what can be done on the IARI backend side
  - actionables could be assigned here
- fix parseTapestry from UrlFlock so that it uses the function from the imported tapestry-parser module
- define and refactor ALL type definitions used by IARE
- DomainDisplay view needs to be refined
- implement signals per URL (old probe method)
  - this should really be in the IARI extract_refs API
    - as it returns URLS, also fetch any probe data for each url specified by probe_columns_to_fetch
    - uses bespoke caching system, where probe data for each url (or domain) is cached
- ADD TESTING!!!
- Check CRA (Create React App) build method and see if we still need Dockerfile and builder.sh
