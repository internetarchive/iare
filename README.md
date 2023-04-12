# Wikipedia Article Reference Explorer (WARE) App

This project uses the React.js framework.\

## Development Scripts

Builds are accomplished with standard node/React scripts.

From the project directory:

### `npm start`

Runs the WARE app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when changes made in the source code.\
Any lint errors found during compilation are shown in the console.

### `npm run build`

Builds a production WARE app to the project's `build` folder.\
The build is minified and ready to be deployed for testing purposes.

## Automatic deployement

Whenever a new commit is uploaded to this repo, a github Action is automatically performed that
creates a production-ready version of the WARE app, and made available at the address:

```
https://internetarchive.github.io/ware/
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


### Organization of components


### External components used

ReactTooltip / react-tooltip
Chart.js
react-chartjs-2
chart.js/helpers
