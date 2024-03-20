# Internet Archive Reference Inventory Dashboard

This project uses the React.js framework.

## Build Scripts

Builds are accomplished with standard node/React scripts.

All scripts should be run from the project directory.

### For Development:
### `npm start`

Runs IARE Dashboard in development mode.\
Open [http://localhost:3300](http://localhost:3300) to run.

* Changes in the source code automatically reloads page.
* Lint errors found during compilation shown in the console.

### For production:
### `npm run build`

Builds a production version of IARI Dashboard app to the `build` folder in the project directory.

The build is minified and ready to be deployed for testing purposes.

## Automatic deployment

Whenever a new commit is uploaded to the iaridash repo, a GitHub Action is automatically performed and
creates a production ready version of app, and made available at the address:

```
https://mojomonger.github.io/iaredash/
```

