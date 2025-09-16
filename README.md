# Internet Archive Reference Explorer (IARE) App

_This document is under development._

This project uses the React.js framework.

## Development Scripts

*Note:* Build process is now with ___vite___. Build instructions coming soon.

Builds are accomplished with standard node/React scripts.

From the project directory:

### `npm start`

Runs the IARE app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

Changes made in the source code automatically reloads the page.\
Any lint errors found during compilation are shown in the console.

### `npm run build`

Builds a production IARE app to the project's `build` folder.\
The build is minified and ready to be deployed for testing purposes.

## Automatic deployment

Whenever a new commit is uploaded to the main branch of the IARE repo, a GitHub action is triggered to create a stable version of the IARE app. This is considered a STAGING release and is available via this url:

```
https://internetarchive.github.io/iare/
```


## Regular Maintenance

To ensure testing tools respect latest browser specs, it is a good idea to run the following command regularly:

### `npx update-browserslist-db@latest`



## Deploy in Docker

Build a deployment Docker image:

```
$ docker image build -t iare .
```

Run a container from the newly built image:

```
$ docker container run --rm -it -p 3000:3000 iare
````

If you are running this locally, you can open the application in a web browser at http://localhost:3000

## Under the Hood

### General Coding Notes

#### NB

Throughout the code you may see "NB ..." in a comment. NB stands for ["Nota Bene"](https://en.wikipedia.org/wiki/Nota_bene), meaning "note well" in latin, and is 
used to call out certain aspects in the code that aren't necessarily "TODO"s to be fixed.

#### Using "ref" as a parameter name 

You cannot use "ref" as a component parameter name in a react javascript project -
it will give strange errors. If you need to use a variable to 
represent a reference, use "_ref". (I found this out the hard way!)

### External components used

* ReactTooltip / react-tooltip
* Chart.js
* react-chartjs-2
* chart.js/helpers
* chart.js options
* chartjs-plugin-datalabels

### Component Architecture

When page data is received from the fetch, it is rendered with the src/components/PageDisplay component, eventually resolving to the src/components/v2/PageDisplayV2 component for typical wiki pages.

The PageDisplayV2 component combines the PageInfo (top-level page retrieval information) component and the PageData component. The PageData component does the heavy lifting of displaying the retrieved page data.

```
<PageDisplayV2 pageData={pageData} >
    <PageInfo pageData={pageData} />
    <PageData pageData={pageData} />
```
#### PageData component

Within the PageData component, the raw data is decorated with anything useful for further rendering, including:
- fetching the status code of all the URLs
- fetching the probe status info for all the URLs
- transforming the references so that they can be filtered and displayed in a more comfortable manner.

"Awaiting..." icon displayed while data is being fetched:

```
<Loader message="..."/> 
```

Once the data is retrieved, it is displayed with the UrlDisplay component:
 ```
 <UrlDisplay pageData={pageData} <options> />
```

There are other display components that can be used to display the page data in different ways from different perspectives. These are less developed than UrlDisplay, but present a rich future of display possibilities. For example:
```
<RefDisplay pageData={pageData} <options> />
```

#### UrlDisplay component
```
<UrlDisplay>
    <UrlOverview>
    <UrlFlock>
    <RefFlock>
```

###### UrlOverview

Contains the graphs and charts depicting URL statistics. Clicking on these charts produces a filter that is applied the URL List (represented by UrlFlock) and the References list (represented by RefFlock)

###### FldDisplay
_(Fld is the legacy moniker for "First Level Domain". It just means the Domains view)_:
```
<FldDisplay>
    <FldFlock>
    <RefFlock>
```
###### RefDisplay
```
<RefDisplay>
    <RefOverview>
    <RefFlock>
```
You will notice that each display type includes the RefFlock component. This is because each view is essentially a grandiose filter for the list of references. The RefFlock component can display a list of references, and receive a filter definition "from the outside".
### Filter / Flock Architecture

TBD

## Bugs and Features


### GitHub Issues

https://github.com/internetarchive/iare/issues
