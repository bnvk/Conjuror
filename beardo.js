var fs      = require("fs");
var cheerio = require("cheerio");
var _       = require('underscore');
var moment  = require('moment');
var argv    = require('argv');
var net     = require('net');
var path    = require('path');
var repl    = require('repl');
var csv     = require('csv');
var wkhtmltopdf = require('wkhtmltopdf');
var beardoDate  = require('./lib/beard_date.js');

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

var args = argv.run();


// File Manipulation
var SaveFile = require('./lib/save_file');

// Beardo
var Beardo = {};

// Load Beardo.Date
Beardo.Date = beardoDate;

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


Beardo.getIngredients = function(config_file, callback){
  // Finds the config file if it exists.
  fs.exists(config_file, function(exists) {
    if (exists) {
      console.log("Found a config file");
      var contents = fs.readFileSync(config_file);
      var config = JSON.parse(contents);
      return callback(config);
    } else {
      return callback({'exists': exists})
    }
  });
}

Beardo.summonUser = function(callback){
  // TODO: We should probably remove the depency on args here, and pass it in
  // as a variable.
  if (args.config !== undefined && args.config.user !== undefined){
    return callback(args.config.user);
  } else {
    return callback({'exists': false});
  }
};

Beardo.magickData = function(data, resource, outputs) {

  // Filter by Date / Type
  var date_filter = 'none';

  if (args.options.date !== undefined) {

    // TODO: would it be easier to just use moment.js for this?
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

    console.log('Filter by ' + date_filter + ': ' + args.options.date);
  }

  // Make Totals
  var increment_output = function(item) {

    outputs.totals.hours += item.time;
    outputs.totals.money += (item.time * item.rate);

    // CLI format
    outputs.cli += item.date + '\t ' + item.time + ' \t' + item.client + ' \t' + item.description + '\n';

    // HTML format
    if (_.indexOf(args.options.format, 'html') > -1 || _.indexOf(args.options.format, 'pdf') > -1) {
      outputs.html += '<tr>\n';
      outputs.html += '   <td>' + item.date + '</td>\n';
      outputs.html += '   <td class="text-right">' + item.time + '</td>\n';
      outputs.html += '   <td class="text-left"> hrs</td>\n';
      outputs.html += '   <td>' + item.description + '</td>\n';
      outputs.html += '</tr>\n';
    }
  };

  _.each(data, function(line, index){
    if (index !== 0){ // skip the first line
      var parts = line;
      // Filter Date & Trim
      var check_date = Beardo.Date[date_filter](parts[0], args.options.date);
      var check_trim = Beardo.Trim(parts);

      if (_.indexOf([check_date, check_trim], false) === -1) {
        var item_output = Beardo.murmurLineToSchema(line, resource.schema);

        increment_output(item_output);
      }
    }
  });

  return outputs;
}

Beardo.murmurLineToSchema = function(parts, schema, fields) {
  // line is the line being processed,
  // schema is the schema provided in the resource,
  // fields is the fields required in the output, if blank it
  // defaults to everything in the schema.
  // var parts = line.split(',');
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
      if (field.type === 'boolean'){
        parsed = parts[index];
        if (parsed === 'yes') parsed = true;
        else if (parsed === 'no') parse = false;
      }

      // For Output
      lineItem[field.name] = parsed;

    }
  });
  return lineItem;
};

Beardo.castToHTML = function(outputs, user){
  // Output HTML

  if (_.indexOf(args.options.format, 'html') > -1 || _.indexOf(args.options.format, 'pdf') > -1) {

    // Get HTML Template
    var template = args.config.invoice_template || 'invoice';
    console.log("Using template:", template);
    var template_path = './templates/' + template + '.html';

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
              var output_name = 'Invoice - ' + moment().format('D MMMM YYYY');
              if (args.options.output) {
                output_name = args.options.output;
              }

              var template_file = buffer.toString("utf8", 0, buffer.length);
              var template_html = _.template(template_file);

              var template_data = {
                generated_name: output_name,
                generated_date: moment().format('Do MMMM, YYYY'),
                hours_rows: outputs.html,
                hours_total: outputs.totals.hours,
                money_total: outputs.totals.money
              };

              if (user !== undefined){
                template_data.user = user;
              }

              var output_html = template_html(template_data);

              // Save HTML file
              if (_.indexOf(args.options.format, 'html') > -1) {
                var saveFile = new SaveFile(fs, 'output/' + output_name + '.html', output_html);
              }

              // Save PDF file
              Beardo.castHTMLToPDF(output_html, output_name);
            });
          });
        });
      }
    });
  }
}

Beardo.castHTMLToPDF = function(output_html, output_name){
  if (_.indexOf(args.options.format, 'pdf') > -1) {
    console.log('Saving as a PDF');
    wkhtmltopdf(output_html, {
      pageSize: 'letter',
      output: 'output/' + output_name + '.pdf'
    });
  }
}

// Load Data & Parse
Beardo.Twirl = function(path, resource, callback) {
  var resource_file = path + '/' + resource.path;
  console.log(resource_file);
  fs.exists(resource_file, function(exists) {
  	if (exists) {

      fs.stat(resource_file, function(error, stats) {
        fs.open(resource_file, "r", function(error, fd) {

          var buffer = new Buffer(stats.size);

          fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
            fs.close(fd);

            var data = buffer.toString("utf8", 0, buffer.length);

            // Totals (for tallying)
            var outputs = {
              totals: {
                hours: 0,
                money: 0.00,
              },
              cli: '',
              html: ''
            };

            // Loop Through Items
            csv.parse(data, function(err, data){
              if (err){
                console.log("Had a problem with the CSV File: ", err);
              }

              outputs = Beardo.magickData(data, resource, outputs);

              // Overwrite outputs.money when we have a fixed price.
              if (args.options.fixedprice) {
                outputs.totals.money = +args.options.fixedprice
              }

              // FIXME: OUTPUT STUFF (Refactor out)
              if (args.options.format) {
                console.log('-----------------------------------------------------------------------------');
                console.log('Output Formats: ' + args.options.format.join(','));
              }

              console.log('-----------------------------------------------------------------------------');
              console.log(outputs.cli);
              console.log('-----------------------------------------------------------------------------');
              console.log('Total hours worked: ' + outputs.totals.hours);
              console.log('Total monies earned: $' + outputs.totals.money);

              Beardo.summonUser(function(user_data) {
                if (user_data && user_data.error === undefined){
                  Beardo.castToHTML(outputs, user_data);
                } else {
                  Beardo.castToHTML(outputs, undefined);
                }
                // return callback for test purposes, and for future func?
                if (callback) return callback();
              })
            });
          });
        });
      });
  	}
  	else {
      console.log('awwww no data');
      // return callback for test purposes, and for future func?
      if (callback) return callback({'error': '404'});
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
  Beardo.getIngredients('.beardo/config.json', function(config){
    // don't really care of the status of config for the moment.
    // let's just supply sensible defaults.
    args.config = config;
    Beardo.Grow(args.options.input);
  });
} else {
  console.log('404 No beard found \nAre you sure you specified an --input -i value');
}

module.exports = Beardo;
