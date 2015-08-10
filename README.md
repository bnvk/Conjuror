Conjuror API
============

This is a simple node server script that loads [Data Packages](http://data.okfn.org) as per OKFN's specification and renders the CSV  data mapped to JSON schema and out displays it in a REST API.

### Dependencies

Make sure that you have [Node.js](http://nodejs.org) installed.

### Installing

1. Clone this repo `git clone https://github.com/bnvk/ConjurorAPI` 
2. Go into directory & install dependencies `npm install`
3. Make a copy of `config.example.json` named `config.json`
4. Edit the values in `config.json` to point to your directory of DataPackages
5. Run the app `node server.js`

You should see the app running at a url like `http://localhost:8888` which will not 

### Using the API

The current API accepts only one parameter at present- the first segment of the URL. This parameter is used to select a data package that is allowed via the `config.datasets` of the config file. This also takes into account `config.prefix` value.

**Example**

To load the dataset called `datapackage-docs` you would load `http://localhost:8888/docs/` and the portion of the config would look like this:

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

*Note: this will most likely get folded into the the regular [Conjuror](https://github.com/bnvk/Conjuror) project at some point, but for now due to more simple use cases it stay separate.*