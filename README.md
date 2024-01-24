# Internet Archive Reference Explorer (IARE) App

This project uses the React.js framework.\

## Development Scripts

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

Whenever a new commit is uploaded to the IARE repo, a GitHub Action is automatically performed that
creates a production-ready version of the IARE app, and made available at the address:

```
https://internetarchive.github.io/iare/
```


## Deploy in Docker

Build a deployment Docker image:

```
$ docker image build -t jsonview .
```

Run a container from the newly built image:

```
$ docker container run --rm -it -p 3000:3000 jsonview
````

Open the application in a web browser at http://localhost:3000

## Under the Hood

### General Coding Notes

Throughout the code you may see "NB ..." in a comment. NB stands for "Nota Bene", meaning "note well" in latin, and is 
used to call out certain aspects in the code worth calling out. See https://en.wikipedia.org/wiki/Nota_bene.

#### Warning! 

You cannot use "ref" as a component variable name in a react javascript project -
it will give you strange errors. If you need to use a variable to 
represent a reference, use "_ref"...I found this out the hard way!

### External components used

* ReactTooltip / react-tooltip
* Chart.js
* react-chartjs-2
* chart.js/helpers

* chart.js options
* chartjs-plugin-datalabels

### React Component Architecture

When page data is received from the fetch, it is rendered with the src/PageDisplay component, eventually resolving to the src/v2/PageDisplayV2 component for typical wiki pages.

The PageDisplayV2 contains the PageInfo component, to display some top-level information about the page retrieval, and the PageData component, which does the actual work of displaying the retrieved page data.

```
<PageDisplayV2>
    <PageInfo pageData={pageData} />
    <PageData pageData={pageData} />
```
Within the PageData component, the data is massaged and decorated with anything that is needed for further rendering. Actions include:
- fetching the status code of all the URLs
- transforming the references so that they can be filtered and displayed in a more comfortable manner.

#### The PageData component
```
<Loader/> // displays while data is being fetched

One of the following views is displayed, showing the information in different ways:

    <FldDisplay pageData={pageData} />
    <UrlDisplay pageData={pageData} <options> />
    <RefDisplay pageData={pageData} <options> />
```

#### UrlDisplay
```
<UrlDisplay>
    <UrlOverview>
    <UrlFlock>
    <RefFlock>
```

#### UrlOverview

Contains the graphs and charts depicting URL statistics. Clicking on these charts produces a filter upon the URL List (represented by UrlFlock)

#### FldDisplay
_(Fld is the legacy moniker for "First Level Domain". It just means the Domains view)_:
```
<FldDisplay>
    <FldFlock>
    <RefFlock>
```
#### RefDisplay
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
