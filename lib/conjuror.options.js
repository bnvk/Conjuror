var argv    = require('argv');

// Args
argv.option({
  name: 'input',
  short: 'i',
  type: 'string',
  description: 'Defines schema file to open',
  example: "'conjuror.js --input=value' or 'conjuror.js -i data/hours.json"
});

argv.option({
  name: 'format',
  short: 'f',
  type: 'csv,string',
  description: 'Defines output formats with html,cli',
  example: "'conjuror.js --format=value' or 'conjuror.js -f value1,value2'"
});

argv.option({
  name: 'output',
  short: 'o',
  type: 'string',
  description: 'Defines name to save output files as',
  example: "'conjuror.js --save=value' or 'conjuror.js -s January Invoice'"
});

argv.option({
  name: 'date',
  short: 'd',
  type: 'string',
  description: 'Returns only by current date (currently month only)',
  example: "'conjuror.js --date=value' or 'conjuror.js -d January or Jan or 01'"
});

argv.option({
  name: 'search',
  short: 's',
  type: 'string',
  description: 'Searches for a string inside of a larger string',
  example: "'conjuror.js --search=magic' or 'conjuror.js -s magic'"
});

argv.option({
  name: 'trim',
  short: 't',
  type: 'list,string',
  description: 'Trims output by a given string value declared in schema',
  example: "'conjuror.js --trim=value' or 'conjuror.js -t Client'"
});

argv.option({
  name: 'price',
  short: 'p',
  type: 'float',
  description: 'Builds the invoice to a fixed price',
  example: "'conjuror.js --price=1000' or 'conjuror.js -p 1000'"
});

argv.option({
  name: 'currency',
  short: 'c',
  type: 'string',
  description: 'Sets the output price for the currency',
  example: "'conjuror.js --currency=$' or 'conjuror.js -c '$''"
});

argv.option({
  name: 'extra',
  short: 'e',
  type: 'string',
  description: 'If your template has an extra information page, add it this way',
  example: "'conjuror.js --extra=\"some extra information\"' or 'conjuror.js -e 'Some Extra Information''"
});

argv.option({
  name: 'invoicenumber',
  short: 'n',
  type: 'string',
  description: 'Invoice Number',
  example: "'conjuror.js --invoicenumber=\"001\"' or 'conjuror.js -n '007''"
});

argv.option({
  name: 'details',
  short: 'l',
  type: 'string',
  description: 'Details',
  example: "'conjuror.js --details=\"hide\"' or 'conjuror.js -l 'hide''"
});

module.exports = argv;
