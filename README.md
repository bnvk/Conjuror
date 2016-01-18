![The Magical Conjuror](images/bearded-wizard.png)

[![NPM](https://nodei.co/npm/conjuror.png)](https://nodei.co/npm/conjuror/)

Conjuror
---

Conjuror is magical wizard who knows how to do cool things with CSV data and dons an epic beard- kind of like Santa Claus, sans the whole naughty or nice bit. Conjuror is based on [Data Packages](http://data.okfn.org/doc/publish), which are a nifty way to wrap simple CSV data in JSON, and was created by the [OKFN](http://okfn.org).

#### Getting Started

1. First install Conjuror `npm install -g conjuror`
1. Then set it up by running setup script `node cli/conjuror-setup.js`
2. To use Conjuror to you will need to make copies of the following two data files:

* `data/_template.csv`
* `data/_template.json`

Rename these files something like `clients.csv` or `receipts.csv` or whatever suits your needs add modify the values of the JSON schema & CSV columns as you see it. Once the schema & CSV matches, you can start adding data items to the CSV such as:

```
date, time, description, client, location, rate
2015-02-07, 2, improved importing of files, conjuror, cafe, 0.00
2015-02-08, 2, updated commands & documentation, mailpile, home, 0.00
```

*You can manually add items to the CSV, or you can use the rough implemenation of the time tracker tool by running a separate script called `ctrack` read more about this below.*

## Conjuror Commands

- `ctrack` - CLI interface to add a new entry to an existing project
- `coutput` - CLI interface to output a report
- `conjuror` - A standard command line tool that accepts various flags

#### Flags

Flag | Short Flag | Behavior
------------ | ------------- | -------------
--help | -h | shows list of commands
--input | -i | selects `data.json` schema file to open up
--formats | -f | allows you to choose different output formats (cli, csv, html, pdf)
--output | -o | specify `Name of File` to be output
--date | -d | filters by numerous date styles `'February, Feb, 02` read below
--search | -s | searches for a string like `magic` contained within a longer string `I love doing magic tricks`
--trim | -t | filters by an item like 'client' (currently hardcoded value)
--price | -p | Override the calculated price with a fixed price
--currency | -c | what currency the thing is in
--extra | -e | Text that appears in `extra` field of template (overrides field in config).
--details | -l | Affects visibility of the `data_details` field in a template (show, hide)
--message | -m | Shows up as a `data_message` in a template
--generated | -g | Allows specifying custom invoice date

Run either of the follow two examples from terminal command line

**Example (trim)**

```
node conjuror.js --input data/clients.json --trim client-name
```

This command should have printed data to your command line that matches your trim parameter.

**Example (output & date)**

```
node conjuror.js -i data/clients.json -o "Feb Invoice" -t client-name --date=Feb
```

The following examples are formats of dates values you can pass using the `--date` flag

- Month - `February` or `Feb` or `02` which picks month of current year
- Exact - `2015-09-04` gets all values since date
- Range - `2015-09-04:to:2015-11-15` selects between two exact values


The above example should have outputted an HTML rendering of your the entries parsed from your data. The output will be located in `output/Feb Invoice.html`

**Note: regarding PDF export**

To generate PDF outputs, you need to install [wkhtmltopdf](http://wkhtmltopdf.org/downloads.html) for your operating system on Debian that is done with `sudo apt-get install wkhtmltopdf`


### Why The Magical Name & Terminology?

Well, there is that quote by Asimov about technology... there is also the [Cyber Wizard Institute](https://github.com/CyberWizardInstitute) which you should check out... and I really wanted to use this icon of a magical bearded wizard which came from my friend Max who is obsessed with JS

![Made in Berlin](images/Made-in-Berlin.png)
