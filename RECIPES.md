Recipes
=======

The following is an example of what I'm thinking a recipe *could* look like and some documentation sketch of what values could represent. There is really only two main aspects to this file and these are described below

```
{
  "formats": ["cli", "csv", "html", "pdf"],
  "filters": {
    "date": ["date"],
    "trim": ["string", "number"],
    "search": ["string", "number"]
  },
  "instructions": [{
    "process": [{
      "increment": "time"
    },{
      "multiply": ["time", "rate"]
    }],
    "template": "tallied-data.html"
  }]
}
```

#### formats

What formats a given recipe can be exported from Conjuror in. Ideally, we can at some point make a bar graph that output in formats `cli,svg` and such...

#### filters

These values are our current calls that filter data, these are the things I've started moving to `datapackage-query` module but have yet to been imported into Conjuror. The following values are "filter tools" and would need to written into Conjuror for a recipe to make use of them.

- date
- trim
- search

In the example above, these values have an `array` which would be "mapped" during a user configuring a project based on the types of value in a `resources[x].schema`

#### instructions

This is an array of objects, each of these objects would contain the following values:

**process**

Will be "operations" that get performed on a given line of data or in reference to the aggregate. Think of it is as instructions for Conjuror modules that get stored in a projects configuration / mapping. Examples aggregate

- increment (hours)
- translate (USD -> Euros)
- multiple (hours * rate)

**template**

An HTML view (or other formats?) to inject the processed operations into. Currently this is just the boring-ish CSV data in an HTML `<table>` view

****

My current thinking on recipes is making them relatively "sculpted" by developers, as playing with the code towards this, it's going to involve HTML templates and various operations! I've added a folder `recipes/invoices/` and `recipes/expenses/`
