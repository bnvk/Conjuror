![The Magical Beardo](images/bearded-wizard.png)

Beardo
------

Beardo, the magical time tracking wizard who knows how you spend all your time and dons an epic beard. Kind of like Santa Claus, sans the whole naughty or nice bit.

## Data

The data which Beardo consumes is simple CSV data that also implements [Data Protocols](http://dataprotocols.org) and was inspired by [this blog post](http://blog.okfn.org/2013/07/02/git-and-github-for-data/) from Rufus Pollock of [OKFN](http://okfn.org). Currently Beardo supports & makes bare minimum use of [JSON Table Schema](http://dataprotocols.org/json-table-schema/). 

#### Getting Started

In order to use Beardo to keep track of something like billable hours / freelance work, locate the following two files:

* `data/_template.csv`
* `data/_template.json`

You're going to want to make a copy of both files and rename them something like `clients.csv` or whatever suits your needs. You can add extra values to the Schema & CSV columns as you see it.

Once the Schema & CSV matches, you can start adding data items to the CSV such as:

```
date, time, description, client, location, rate
2015-02-07, 2, improved importing of files, beardo, cafe, 0.00
2015-02-08, 2, updated commands & documentation, beardo, home, 0.00
```

Currently, you need to need manually add items to the CSV, which is less than ideal, but an easy time tracker command is next on the agenda, we promise!


## Commands

To perform reports just type `node beardo.js` into your command line with one of the following flags

#### Flags

Flag | Short Flag | Behavior
------------ | ------------- | -------------
--help | -h | shows list of commands
--input | -i | selects `data.json` schema file to open up
--format | -f | allows you to choose different output formats (currently html, cli)
--output | -o | specif `Name of File.html` being output
--date | -d | filters by date `'February, Feb, 01` allows case insensitive 
--trim | -t | filters by an item like 'client' (currently hardcoded value)

**Example (trim)**

Run from CLI `node beardo.js --input data/clients.json --trim client-name`

**Example (output & date)**

Run from CLI `node beardo.js -i data/clients.json -o Feb Invoice -t client-name --date Feb`


### Okay, What's With the Weird Name?

Did you know beards could tell time? No truly, Beards are a magical wonder of nature. Much like the rings of old growth tree, each and every beard contains a unique record of the health and life lived by the beard grower. Was the grower properly nourished throughout the cold winter months? Do they have a health sex life? Do they drink too much alcohol? A good proper full beard knows all. 

Since I am one of those of those rare individuals who suffer from Beard envy, in that I cannot really grow a proper beard, I decided to make a prosthetic beard- or rather an experiment in open data and time tracking / invoicing software that keeps record of my work and activities.

