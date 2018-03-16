REST API
========

This is a simple node server script that loads [DataHub](https://datahub.io) 
as per `data-package` [specification](https://datahub.io/docs/data-packages) and 
renders a CSV as JSON data via a querieable REST API.

## Installing

Make sure that you have [Node.js](http://nodejs.org) installed.

1. Clone this repo `git clone https://github.com/bnvk/Conjuror` 
2. Go into directory & install dependencies `npm install`
3. Make a copy of `api.example.json` named `api.json`
4. Edit the values in `api.json` to point to your directory of DataPackages
5. Run the app `node server.js`

You should see the app running at a url like `http://localhost:8888` which will not 

## Using the API

The current API accepts only one parameter at present- the first segment of the
URL. This parameter is used to select a data package that is allowed via the
`config.datasets` of the config file. This also takes into account
`config.prefix` value.

**Example** - if your `api.json` file looked like

```
  "paths": {
    "data": "/path/to/data-packages/"
  },
  "prefix": "datapackage-",
  "datasets": [
    "docs",
    "pictures"
  ]
```

It would make the following datasets available at

- `datapackage-docs` - http://localhost:8888/docs/
- `datapackage-pictures` - http://localhost:8888/pictures
