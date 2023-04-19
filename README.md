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


### External components used

* ReactTooltip / react-tooltip
* Chart.js
* react-chartjs-2
* chart.js/helpers

* chart.js options
* chartjs-plugin-datalabels

### React Component Architecture

TBD

### Filter / Flock Architecture

TBD


