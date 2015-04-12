
var cheerio = require("cheerio");
var _       = require('underscore');
var moment  = require('moment');
var net     = require('net');
var path    = require('path');
var repl    = require('repl');
var csv     = require('csv');
var wkhtmltopdf = require('wkhtmltopdf');
var beardoDate  = require('./lib/beardo.date.js');
var argv    = require('./lib/beardo.options.js');

// Run the imported options.
var args = argv.run();

// File Manipulation
var SaveFile = require('./lib/save_file');

// Beardo
var Beardo = require('./lib/beardo.prepareRecipe.js');

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


Beardo.getClient = function() {

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

Beardo.magickData = function(data, schema, date) {
  var outputs = {
    totals: {
      hours: 0,
      money: 0.00,
    },
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

    if (is_week.exec(date)) {
      date_filter = 'this_week';
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
      var check_date = Beardo.Date[date_filter](parts[0], date);
      var check_trim = Beardo.Trim(parts);

      if (_.indexOf([check_date, check_trim], false) === -1) {
        var item_output = Beardo.murmurLineToSchema(line, schema);
        increment_output(item_output);
      }
    }
  });
  return outputs;
}

Beardo.castToHTML = function(outputs, user){
  // Output HTML

  if (_.indexOf(args.options.format, 'html') > -1 || _.indexOf(args.options.format, 'pdf') > -1) {

    // Get HTML Template
    var template = args.config.invoice_template || 'invoice';
    console.log("Using template:", template);
    var template_path = './templates/' + template + '.html';

    Beardo.readManuscript(template_path)
      .then(function(buffer) {
        console.log("Beardo loaded template");
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
          var saveFile = new SaveFile(fs, 'output/' + output_name + '.html', output_html);
        }

        // Save PDF file
        Beardo.castHTMLToPDF(output_html, output_name);
      }, then(function(err) {
        console.log("Failed to find template.")
      }));
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

  Beardo.readManuscript(resource_file)
    .then(function(buffer) {
      var data = buffer.toString("utf8", 0, buffer.length);

      // Totals (for tallying)

      // Loop Through Items
      csv.parse(data, function(err, data){
        if (err){
          console.log("Had a problem with the CSV File: ", err);
        }

        var outputs = Beardo.magickData(data, resource.schema, args.options.date);

        // Overwrite outputs.money when we have a fixed price.
        if (args.options.fixedprice) {
          outputs.totals.money = +args.options.fixedprice
        }

        if (args.options.trim !== undefined) {
          outputs.clients = Beardo.getClient(args.options.trim);
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
        console.log('Total monies earned: ' + (args.options.currency || '$') + outputs.totals.money);

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
    }, function(error) {
      console.log('awwww no data');
      if (callback) return callback(Error);
    });
};


// Load Schema
Beardo.Grow = function(schema_file) {

  var path = require('path').dirname(schema_file);
  console.log(path);

  Beardo.readManuscript(schema_file)
    .then(function(buffer) {
      var json = buffer.toString("utf8", 0, buffer.length);
      var schema = JSON.parse(json);

      console.log('Get item from schema: ' + schema[0].name);

      // If Schema Contains Multiple
      _.each(schema[0].resources, function(resource, key) {

        console.log('Twirl resource: ' + resource.path);

        // Open Data
        Beardo.Twirl(path, resource);

      });
    }, function(error) {
      console.log(error);
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
