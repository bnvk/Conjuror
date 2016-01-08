var Promise = require('es6-promise').Promise;
var cheerio = require("cheerio");
var fs      = require("fs");
var _       = require('underscore');
var moment  = require('moment');
var net     = require('net');
var path    = require('path');
var repl    = require('repl');
var csv     = require('csv');
var wkhtmltopdf   = require('wkhtmltopdf');
var config        = require('./lib/conjuror.config.js')
var argv          = require('./lib/conjuror.options.js');

// Run the imported options.
var args = argv.run();

// File Manipulation
var SaveFile = require('./lib/save_file');

// Conjuror
var Conjuror = require('./lib/conjuror.prepareRecipe.js');

// Load Conjuror Modules
Conjuror.Date = require('./lib/conjuror.date.js');
Conjuror.Trim = require('./lib/conjuror.trim.js');
Conjuror.Search = require('./lib/conjuror.search.js');

// App path
var app_path = __filename.replace('conjuror.js', '')

Conjuror.getClient = function(client_file, trim, callback) {
  // Takes as input a client.json file, the client slug to trim by,
  // the callback function which acts on the client object.
  Conjuror.readData(client_file, function(data) {
    // TODO: We need *way* better error handling here.
    if (data.data !== undefined && trim !== undefined) {

      data.data.splice(0,1);
      clientData = data.data;
      var foundClient = _.find(clientData, function(line, index){
        if (line) {

          var lineItem = Conjuror.murmurLineToSchema(line, data.schema);
          return lineItem.slug.toString() === trim.toString();
        } else {
          return false;
        }
      });

      return callback(Conjuror.murmurLineToSchema(foundClient, data.schema));
    } else {
      return callback(undefined);
    }
  });
}


Conjuror.summonUser = function(callback){
  // TODO: We should probably remove the depency on args here, and pass it in
  // as a variable.
  if (args.config !== undefined && args.config.user !== undefined){
    return callback(args.config.user);
  } else {
    return callback({'exists': false});
  }
};

Conjuror.magickData = function(data, schema, date) {

  var outputs = {
    totals: {
      hours: 0,
      money: 0.00,
    },
    csv: _.pluck(schema.fields, 'name').join(','),
    cli: '',
    html: ''
  };
  // Filter by Date / Type
  var date_filter = 'none';

  if (date !== undefined) {

    // TODO: would it be easier to just use moment.js for this?
    var is_date_full        = /[0-9]{4}-[0-9]{2}-[0-9]{2}/;
    var is_date_year_month  = /[0-9]{4}-[0-9]{2}/;
    var is_date_month_day   = /[0-9]{2}-[0-9]{2}/;
    var is_date_year        = /[0-9]{4}/;
    var is_week             = /week/;
    var is_month            = /month/;
    var is_today            = /today/;

    if (date.indexOf(':to:') > -1) {
      date_filter = 'range';
    }
    else if (is_week.exec(date)) {
      date_filter = 'this_week';
    } else if (is_today.exec(date)) {
      date_filter = 'today';
    } else if (is_month.exec(date)) {
      date_filter = 'this_month';
    } else if (is_date_full.exec(date)) {
      date_filter = 'full';
    } else if (is_date_year_month.exec(date)) {
      date_filter = 'year_month';
    } else if (is_date_month_day.exec(date)) {
      date_filter = 'month_day';
    } else if (is_date_year.exec(date)) {
      date_filter = 'year';
    } else {
      date_filter = 'month';
    }

    console.log('Filter by ' + date_filter + ': ' + date);
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
      outputs.html += '   <td class="width-50">' + item.date + '</td>\n';
      outputs.html += '   <td class="width-50">' + item.client + '</td>\n';
      outputs.html += '   <td class="text-right">' + item.time + '</td>\n';
      outputs.html += '   <td class="text-left"> hrs</td>\n';
      outputs.html += '   <td>' + item.description + '</td>\n';
      outputs.html += '</tr>\n';
    }
  };

  _.each(data, function(line, index) {

    if (index !== 0){ // skip the first line
      var parts = line;

      // Filter Date & Trim
      var check_date    = Conjuror.Date[date_filter](parts[0], date);
      var check_trim    = Conjuror.Trim(args.options.trim, parts);
      var check_search  = Conjuror.Search(parts, args.options.search);

      // Does Item Meet Filter (date, trim)
      if (_.indexOf([check_date, check_trim, check_search], false) === -1) {

        // Build CSV format (FIXME: nasty code organization going on here)
        if (_.indexOf(args.options.format, 'csv') > -1) {
          outputs.csv += '\n' + line.join(',');
        }

        var item_output = Conjuror.murmurLineToSchema(line, schema);
        increment_output(item_output);
      }
    }
  });

  // Outputs
  outputs.totals.hours = outputs.totals.hours.toFixed(2);
  outputs.totals.money = outputs.totals.money.toFixed(2);
  return outputs;
}


Conjuror.castToCSV = function(outputs) {

  if (_.indexOf(args.options.format, 'csv') > -1) {

    // File Name
    var output_name = 'Conjuror Output - ' + moment().format('D MMMM YYYY');
    if (args.options.output) {
      output_name = args.options.output;
    }

    // Save CSV
    var saveFile = SaveFile(fs, app_path + 'output/' + output_name + '.csv', outputs.csv);
  }
}


// Output HTML
Conjuror.castToHTML = function(outputs, user){

  if (_.indexOf(args.options.format, 'html') > -1 || _.indexOf(args.options.format, 'pdf') > -1) {

    // Get HTML Template
    var template = args.config.invoice_template || 'invoice';
    var template_path = app_path + 'templates/' + template + '.html';

    Conjuror.readManuscript(template_path)

      .then(function(buffer) {
        console.log("Conjuror loaded template");
        var output_name = 'Invoice - ' + moment().format('D MMMM YYYY');

        if (outputs.client) {
          output_name = args.options.invoicenumber + ' - ' +
            outputs.client.name + ' - ' +
            moment().format('DD.MM.YYYY');
        } else if (args.options.output) {
          output_name = args.options.output;
        }

        var template_file = buffer.toString("utf8", 0, buffer.length);
        var template_html = _.template(template_file);

        var template_data = {
          client: outputs.client,
          invoice_number: args.options.invoicenumber,
          generated_name: output_name,
          generated_date: moment().format('Do MMMM, YYYY'),
          hours_rows: outputs.html,
          hours_total: outputs.totals.hours,
          money_total: outputs.totals.money,
        };

        if (user !== undefined){
          template_data.user = user;
          template_data.currency = user.currency;
        }

        template_data.currency = args.options.currency || '$';
        template_data.extra = args.options.extra || '';

        var output_html = template_html(template_data);
        // Save HTML file
        if (_.indexOf(args.options.format, 'html') > -1) {
          var saveFile = SaveFile(fs, app_path + 'output/' + output_name + '.html', output_html);
        }

        // Save PDF file
        Conjuror.castHTMLToPDF(output_html, output_name);
      }, function(err) {
        console.log("Failed to find template.");
      });
  }
};

Conjuror.castHTMLToPDF = function(output_html, output_name){
  if (_.indexOf(args.options.format, 'pdf') > -1) {
    console.log('Saving as a PDF');
    wkhtmltopdf(output_html, {
      pageSize: 'letter',
      output: app_path + 'output/' + output_name + '.pdf'
    });
  }
};


// Load Data & Parse
Conjuror.Twirl = function(path, resource, client_path, callback) {
  var resource_file = path + '/' + resource.path;

  Conjuror.readManuscript(resource_file)
    .then(function(buffer) {

      var data = buffer.toString("utf8", 0, buffer.length);

      // Loop Through Items
      csv.parse(data, function(err, data) {

        // Load client (pertains to invoicing)
        Conjuror.getClient(client_path, args.options.trim, function(client) {

          if (err){
            console.log("Had a problem with the CSV File: ", err);
          }

          var outputs = Conjuror.magickData(data, resource.schema, args.options.date);
          outputs.client = client;

          // Output CSV - rough implementation https://github.com/bnvk/Conjuror/issues/36
          Conjuror.castToCSV(outputs);

          // This Section is needed if there are "totals"
          // Overwrite outputs.money when we have a fixed price.
          if (args.options.price) {
            outputs.totals.money = +args.options.price
          }

          if (args.options.format) {
            console.log('-----------------------------------------------------------------------------');
            console.log('Output Formats: ' + args.options.format.join(','));
          }

          console.log('-----------------------------------------------------------------------------');
          console.log(outputs.cli);
          console.log('-----------------------------------------------------------------------------');
          console.log('Total hours worked: ' + outputs.totals.hours);
          console.log('Total monies earned: ' + (args.options.currency || '$') + outputs.totals.money);

          // Get User
          Conjuror.summonUser(function(user_data) {
            if (user_data && user_data.error === undefined){
              Conjuror.castToHTML(outputs, user_data);
            } else {
              Conjuror.castToHTML(outputs, undefined);
            }
            // return callback for test purposes, and for future func?
            if (callback) return callback();
          })
        })
      });
    }).catch(function(error) {
      console.log("Error while Twirling: ", error);
      if (callback) return callback(Error);
    });
};


// Load Schema
Conjuror.Grow = function(schema_file) {
  var dataPath = require('path').dirname(schema_file);

  Conjuror.readManuscript(schema_file)
    .then(function(buffer) {
      var json = buffer.toString("utf8", 0, buffer.length);
      var schema = JSON.parse(json);

      console.log('Get item from schema: ' + schema[0].name);

      // If Schema Contains Multiple
      _.each(schema[0].resources, function(resource, key) {

        console.log('Twirl resource: ' + resource.path);
        // Open Data
        Conjuror.Twirl(dataPath, resource, schema[0].clients);

      });
    }).catch(function(error) {
      console.log(error);
    });
};

// Start It Up
if (args.options.input !== undefined) {
  Conjuror.getIngredients(config.get_file_path(), function(config) {
    // don't really care of the status of config for the moment.
    // let's just supply sensible defaults.
    args.config = config;
    Conjuror.Grow(args.options.input);
  });
} else {
  console.log('404 No spell found \nAre you sure you specified an --input -i value');
}

module.exports = Conjuror;
