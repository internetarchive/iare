# Wikipedia Article Reference Explorer (WARE) App

This project uses the React.js framework.\
Builds are accomplished with standard node/React scripts.

## Available Scripts

From the project directory:

### `npm start`

Runs the WARE app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm run build`

Builds the WARE app for production to the `build` folder.\
The build is minified and ready to be deployed!


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
