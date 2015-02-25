var fs      = require("fs");
var cheerio = require("cheerio");
var _       = require('underscore');
var moment  = require('moment');
var argv    = require('argv');
var net     = require('net');
var path    = require('path');
var repl    = require('repl');


// Args
argv.option({
  name: 'input',
  short: 'i',
  type: 'string',
  description: 'Defines schema file to open',
  example: "'beardo.js --schema=value' or 'beardo.js -s data/hours.json"
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

var args = argv.run();


// File Manipulation
var SaveFile = require('./lib/save_file');


// Beardo
var Beardo = {};

Beardo.Date = {};

Beardo.Date.full = function(date) {

  var this_date = date.replace(/-/g,'');
  var filter_date = args.options.date.replace(/-/g, '');

  if (this_date >= filter_date) {
    //console.log('this date: 'this_date + ' is greater than filter date: ' + filter_date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.year_month = function(date) {

  if (date.indexOf(args.options.date) > -1) {
    //console.log('date filter by year_month ' + date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.month_day = function(date) {

  if (date.indexOf(args.options.date) > -1) {
    //console.log('date filter by month_day ' + date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.year = function(date) {

  if (date.indexOf(args.options.date) > -1) {
    //console.log('date filter by year ' + date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.month = function(date) {

  var date_trim = args.options.date.toLowerCase();
  var date_full = moment(date).format('MMMM').toLowerCase();
  var date_abbr = moment(date).format('MMM').toLowerCase();
  var date_numb = moment(date).format('MM').toLowerCase();

  if (_.indexOf([date_full, date_abbr, date_numb], date_trim) > -1) {
    //console.log('date matches filter: ' + date_trim)
    return true;
  } else {
    return false;
  }
};


Beardo.Date.none = function(parts) {
  console.log('no date filtering performed');
};


Beardo.Trim = function(parts) {
  if (args.options.trim !== undefined) {

    var part = parts[3].trim();

    if (_.indexOf(args.options.trim, part) > -1) {
      //console.log('client: ' + part + ' matches: ' + args.options.trim);
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};


// Load Data & Parse
Beardo.Twirl = function(path, resource) {

  var resource_file = path + '/' + resource.path;

  fs.exists(resource_file, function(exists) {
  	if (exists) {

  		console.log('Beardo is twirling some data');

      fs.stat(resource_file, function(error, stats) {
        fs.open(resource_file, "r", function(error, fd) {

          var buffer = new Buffer(stats.size);

          fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
            fs.close(fd);

            var data = buffer.toString("utf8", 0, buffer.length);
            var lines = data.split("\n");
            delete lines[0];

            var hours = 0;

            // Totals (for tallying)
            // console.log(resource.schema.fields);
            var outputs = {
              totals: {
                hours: 0,
                money: 0.00,
              },
              cli: '',
              html: ''
            };


            // Make Totals
            var increment_output = function(item) {

              outputs.totals.hours += item.time;
              outputs.totals.money += (item.time * item.rate);

              // CLI format
              outputs.cli += item.date + ' ' + item.time + ' \t' + item.client + ' \t' + item.description + '\n';

              // HTML format
              if (_.indexOf(args.options.format, 'html') > -1) {
                outputs.html += '<tr>\n';
                outputs.html += '   <td>' + item.date + '</td>\n';
                outputs.html += '   <td class="text-right">' + item.time + '</td>\n';
                outputs.html += '   <td class="text-left"> hrs</td>\n';
                outputs.html += '   <td>' + item.description + '</td>\n';
                outputs.html += '</tr>\n';
              }
            };

            var mapLineToSchema = function(line, schema, fields){
              // line is the line being processed,
              // schema is the schema provided in the resource,
              // fields is the fields required in the output, if blank it
              // defaults to everything in the schema.
              var parts = line.split(',');
              var lineItem = {};

              _.each(schema.fields, function(field, index){
                if (fields === undefined || fields.indexOf(field.name) !== -1){
                  var parsed;

                  if (field.type === 'date') {
                    parsed = moment(parts[index]).format('D MMM');
                  }
                  if (field.type === 'number'){
                    parsed = parseFloat(parts[index]);
                  }
                  if (field.type === 'string'){
                    parsed = parts[index].trim();
                  }
                  lineItem[field.name] = parsed;

                }
              });
              return lineItem;
            };


            // Filter by Date / Type
            var date_filter = 'none';

            if (args.options.date !== undefined) {

              var is_date_full        = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
              var is_date_year_month  = /[0-9]{4}-[0-9]{2}/;
              var is_date_month_day   = /[0-9]{2}-[0-9]{2}/;
              var is_date_year        = /[0-9]{4}/;

              if (is_date_full.exec(args.options.date)) {
                date_filter = 'full';
              } else if (is_date_year_month.exec(args.options.date)) {
                date_filter = 'year_month';
              } else if (is_date_month_day.exec(args.options.date)) {
                date_filter = 'month_day';
              } else if (is_date_year.exec(args.options.date)) {
                date_filter = 'year';
              } else {
                date_filter = 'month';
              }

              console.log('filter date by: ' + date_filter);
            }

            // Loop Through Items
            _.each(lines, function(line, key) {

              // FIXME: ADD MUCH BETTER CHECKING OF EMPTY LINES
              if (line && line !== undefined) {

                var parts = line.split(',');

                // Filter Date & Trim
                var check_date = Beardo.Date[date_filter](parts[0]);
                var check_trim = Beardo.Trim(parts);

                if (_.indexOf([check_date, check_trim], false) === -1) {

                  var item_output = mapLineToSchema(line, resource.schema);

                  increment_output(item_output);
                }
              }
            });


            // FIXME: OUTPUT STUFF (Refactor out)
            console.log('-----------------------------------------------------------------------------');
            console.log('Output Formats: ' + args.options.format);
            console.log('-----------------------------------------------------------------------------');
            console.log(outputs.cli);
            console.log('-----------------------------------------------------------------------------');
            console.log('Total hours worked: ' + outputs.totals.hours);
            console.log('Total monies earned: $' + outputs.totals.money);

            // Output HTML
            if (_.indexOf(args.options.format, 'html') > -1) {


              // Get HTML Template
              var template_path = './templates/invoice.html';

              // Open
              fs.exists(template_path, function(exists) {
              	if (exists) {

              		console.log('Beardo loaded template');
                  fs.stat(template_path, function(error, stats) {
                    fs.open(template_path, "r", function(error, fd) {
                      var buffer = new Buffer(stats.size);
                      fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                        fs.close(fd);

                        // Invoice Name
                        var output_name = 'Beardo - ' + moment().format('D MMMM YYYY');
                        if (args.options.output) {
                          output_name = args.options.output;
                        }

                        var template_file = buffer.toString("utf8", 0, buffer.length);
                        var template_html = _.template(template_file);
                        var output_html   = template_html({
                          generated_name: output_name,
                          generated_date: moment().format('Do MMMM, YYYY'),
                          hours_rows: outputs.html,
                          hours_total: outputs.totals.hours,
                          money_total: outputs.totals.money
                        });

                        var saveFile = new SaveFile(fs, 'output/' + output_name + '.html', output_html);

                      });
                    });
                  });
                }
              });
            }
          });
        });
      });
  	}
  	else {
      console.log('awwww no data');
  	}

  });

};


// Load Schema
Beardo.Grow = function(schema_file) {

  fs.exists(schema_file, function(exists) {
  	if (exists) {

  		console.log('Splendid schema exists open it up');

      var path = require('path').dirname(schema_file);

      fs.stat(schema_file, function(error, stats) {
        fs.open(schema_file, "r", function(error, fd) {

          var buffer = new Buffer(stats.size);

          fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
            fs.close(fd);

            var json = buffer.toString("utf8", 0, buffer.length);
            var schema = JSON.parse(json);

            console.log('Get item from schema: ' + schema[0].name);

            // If Schema Contains Multiple
            _.each(schema[0].resources, function(resource, key) {

              console.log('Twirl resource: ' + resource.path);

              // Open Data
              Beardo.Twirl(path, resource);

            });

          });

        });
      });

    }
    else {
      console.log('awwww no schema');
    }

  });
};



// Start It Up
if (args.options.input !== undefined) {
  Beardo.Grow(args.options.input);
} else {
  console.log('404 No beard found \nAre you sure you specified an --input -i value');
}

