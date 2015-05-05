var argv    = require('argv');

// Args
argv.option({
  name: 'input',
  short: 'i',
  type: 'string',
  description: 'Defines schema file to open',
  example: "'beardo.js --input=value' or 'beardo.js -i data/hours.json"
});

argv.option({
  name: 'format',
  short: 'f',
  type: 'csv,string',
  description: 'Defines output formats with html,cli',
  example: "'beardo.js --format=value' or 'beardo.js -f value1,value2'"
});

argv.option({
  name: 'output',
  short: 'o',
  type: 'string',
  description: 'Defines name to save output files as',
  example: "'beardo.js --save=value' or 'beardo.js -s January Invoice'"
});

argv.option({
  name: 'date',
  short: 'd',
  type: 'string',
  description: 'Returns only by current date (currently month only)',
  example: "'beardo.js --date=value' or 'beardo.js -d January or Jan or 01'"
});

argv.option({
  name: 'trim',
  short: 't',
  type: 'list,string',
  description: 'Trims output by a given string value declared in schema',
  example: "'beardo.js --trim=value' or 'beardo.js -t Client'"
});

argv.option({
  name: 'fixedprice',
  short: 'p',
  type: 'float',
  description: 'Builds the invoice to a fixed price',
  example: "'beardo.js --fixedprice=1000' or 'beardo.js -p 1000'"
});

argv.option({
  name: 'currency',
  short: 'c',
  type: 'string',
  description: 'Sets the output price for the currency',
  example: "'beardo.js --currency=$' or 'beardo.js -c '$''"
});

argv.option({
  name: 'extra',
  short: 'e',
  type: 'string',
  description: 'If your template has an extra information page, add it this way',
  example: "'beardo.js --extra=\"some extra information\"' or 'beardo.js -e 'Some Extra Information''"
});

module.exports = argv;
