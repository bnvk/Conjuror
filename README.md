![The Magical Beardo](images/bearded-wizard.png)

Beardo
------

Beardo, the magical time tracking wizard who knows how you spend all your time and dons an epic beard. Kind of like Santa Claus, sans the whole naughty or nice bit.

## Data

The data which Beardo consumes is simple CSV data that also implements [Data Protocols](http://dataprotocols.org) and was inspired by [this blog post](http://blog.okfn.org/2013/07/02/git-and-github-for-data/) from Rufus Pollock of [OKFN](http://okfn.org)

## Commands

Currently just type `node beardo.js` into your command line.

## Flags

Flag | Short Flag | Behavior
------------ | ------------- | -------------
--help | -h | shows list of commands
--input | -i | selects `data.json` schema file to open up
--format | -f | allows you to choose different output formats (currently html, cli)
--output | -o | specif `Name of File.html` being output
--date | -d | filters by date `'February, Feb, 01` allows case insensitive 
--trim | -t | filters by an item like 'client' (currently hardcoded value)


### Okay, What's With the Weird Name?

Did you know beards could tell time? No truly, Beards are a magical wonder of nature. Much like the rings of old growth tree, each and every beard contains a unique record of the health and life lived by the beard grower. Was the grower properly nourished throughout the cold winter months? Do they have a health sex life? Do they drink too much alcohol? A good proper full beard knows all. 

Since I am one of those of those rare individuals who suffer from Beard envy, in that I cannot really grow a proper beard, I decided to make a prosthetic beard- or rather an experiment in open data and time tracking / invoicing software that keeps record of my work and activities.

