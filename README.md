![The Magical Conjuror](images/bearded-wizard.png)

Conjuror
---

Conjuror, the magical time tracking wizard who knows how you spend all your time and dons an epic beard. Kind of like Santa Claus, sans the whole naughty or nice bit.

## Data Format

The data which Conjuror consumes is simple CSV data that also implements [Data Protocols](http://dataprotocols.org) and was inspired by [this blog post](http://blog.okfn.org/2013/07/02/git-and-github-for-data/) from Rufus Pollock of [OKFN](http://okfn.org). Currently Conjuror supports & makes bare minimum use of [JSON Table Schema](http://dataprotocols.org/json-table-schema/).

#### Getting Started

1. First thing to do is create a config file by running `node setup.js` and walk through the steps
2. In order to use Conjuror to keep track of something like billable hours / freelance work, locate the following two files:

* `data/_template.csv`
* `data/_template.json`

Make a copy of both files and rename them something like `clients.csv` or `receipts.csv` whatever suits your needs. You can add extra values to the Schema & CSV columns as you see it.

Once the Schema & CSV matches, you can start adding data items to the CSV such as:

```
date, time, description, client, location, rate
2015-02-07, 2, improved importing of files, conjuror, cafe, 0.00
2015-02-08, 2, updated commands & documentation, mailpile, home, 0.00
```

You can manually add items to the CSV, or you can use the rough implemenation of the time tracker tool by running a separate script called `track.js` read more about this below.

## Commands

To perform reports just type `node conjuror.js` into your command line with one of the following flags

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
--details | -l | Affects visibility of the `data_details` field in a templay (show, hide)
--message | -m | Shows up as a `data_message` in a template

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

To generate PDF outputs, you need to install [wkhtmltopdf](http://wkhtmltopdf.org/downloads.html) for your operating system,


Tracker (adding entries)
---

There is currently a rough tracker tool that allows adding of entries via an interactive CLI. To this tool, type the following command:

```
node track.js -i path/to/your-file.csv
```

The track tool will then open that file and create suggestions that make it easier to add items that match that of previous entries. This feature is rough and has not been tested should be somewhat useful.

*Tracker tool will eventually be merged into a unified CLI once [Issue #17](https://github.com/bnvk/Conjuror/issues/17) is completed*

### Why The Magical Name & Terminology?

Well, this used to be called Beardo, which was a joke, but then I realized a big part of the name was because I really only wanted to use this icon of a magical bearded wizard. It's also largely inspired by the [@CyberWizardInstitute](https://github.com/CyberWizardInstitute).

![Made in Berlin](images/Made-in-Berlin.png)
