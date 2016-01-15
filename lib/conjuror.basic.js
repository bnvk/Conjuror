var chalk   = require('chalk')
var Promise = require('es6-promise').Promise
var cheerio = require("cheerio")
var fs      = require("fs")
var _       = require('underscore')
var moment  = require('moment')
var net     = require('net')
var path    = require('path')
var repl    = require('repl')
var csv     = require('csv')
var wkhtmltopdf   = require('wkhtmltopdf')

// File Manipulation
var SaveFile = require('./save_file')

// Conjuror
var Conjuror = require('./conjuror.prepareRecipe.js')

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
  if (Conjuror.args.config !== undefined && Conjuror.args.config.user !== undefined){
    return callback(Conjuror.args.config.user);
  } else {
    return callback({'exists': false});
  }
};

Conjuror.magickData = function(data, schema, date) {

  console.log(schema.billing_to)

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
    } else if (is_week.exec(date)) {
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

    console.log(chalk.blue(' - Date filter ' + date_filter + ': ' + date))
  }

  // Make Totals
  var increment_output = function(item) {

    outputs.totals.hours += item.time;
    outputs.totals.money += (item.time * item.rate);

    // CLI format
    outputs.cli += item.date + '\t ' + item.time + ' \t' + item.client + ' \t' + item.description + '\n';

    // HTML format
    if (_.indexOf(Conjuror.args.options.formats, 'html') > -1 || _.indexOf(Conjuror.args.options.formats, 'pdf') > -1) {
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
      var check_trim    = Conjuror.Trim(Conjuror.args.options.trim, parts);
      var check_search  = Conjuror.Search(parts, Conjuror.args.options.search);

      // Does Item Meet Filter (date, trim)
      if (_.indexOf([check_date, check_trim, check_search], false) === -1) {

        // Build CSV format (FIXME: nasty code organization going on here)
        if (_.indexOf(Conjuror.args.options.format, 'csv') > -1) {
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

  if (_.indexOf(Conjuror.args.options.formats, 'csv') > -1) {

    // File Name
    var output_name = 'Conjuror Output - ' + moment().formats('D MMMM YYYY');
    if (Conjuror.args.options.output) {
      output_name = Conjuror.args.options.output;
    }

    // Save CSV
    var saveFile = SaveFile(fs, Conjuror.args.app_path + 'output/' + output_name + '.csv', outputs.csv);
  }
}


// Output HTML
Conjuror.castToHTML = function(outputs, user, resource) {

  if (_.indexOf(Conjuror.args.options.formats, 'html') > -1 || _.indexOf(Conjuror.args.options.formats, 'pdf') > -1) {

    // Determine Template & Path
    var template = Conjuror.args.config.default_template || 'invoice'
    if (resource.templates !== undefined && resource.templates.length > 0) {
      template = resource.templates[0]
    }

    var template_path = Conjuror.args.app_path + 'templates/'
    if (Conjuror.args.config.path_templates !== undefined) {
      template_path = Conjuror.args.config.path_templates
    }

    // Load Template
    Conjuror.readManuscript(template_path + template + '.html')
      .then(function(buffer) {

        console.log(chalk.green(chalk.blue(" - Loaded template: " + template_path + template + '.html')))
        var output_name = 'Invoice - ' + moment().format('D MMMM YYYY')

        if (outputs.client) {
          output_name = Conjuror.args.options.invoicenumber + ' - ' +
            outputs.client.name + ' - ' +
            moment().format('DD.MM.YYYY')
        }

        if (Conjuror.args.options.output) {
          output_name = Conjuror.args.options.output
        }

        if (Conjuror.args.options.details) {
          var data_details = Conjuroro.args.options.details
        } else {
          var data_details = 'show'
        }

        if (Conjuror.args.options.message) {
          var data_message = Conjuroro.args.options.message
        } else {
          var data_message = false
        }

        var template_file = buffer.toString("utf8", 0, buffer.length)
        var template_html = _.template(template_file)

        var template_data = {
          schema: resource.schema,
          client: outputs.client,
          invoice_number: Conjuror.args.options.invoicenumber,
          generated_name: output_name,
          generated_date: moment().format('Do MMMM, YYYY'),
          data_details: data_details,
          data_message: data_message,
          hours_rows: outputs.html,
          hours_total: outputs.totals.hours,
          money_total: outputs.totals.money,
        }

        if (user !== undefined){
          template_data.user = user
          template_data.currency = user.currency
        }

        template_data.currency = Conjuror.args.options.currency || '$'
        template_data.extra = Conjuror.args.options.extra || ''

        var output_html = template_html(template_data)

        // Save HTML file
        if (_.indexOf(Conjuror.args.options.formats, 'html') > -1) {
          var saveFile = SaveFile(fs, Conjuror.args.app_path + 'output/' + output_name + '.html', output_html)
        }

        // Save PDF file
        Conjuror.castHTMLToPDF(output_html, output_name);
      }, function(err) {
        console.log(chalk.red("Failed to find template: " + template_path + template + '.html'))
      })
  }
}

Conjuror.castHTMLToPDF = function(output_html, output_name){
  if (_.indexOf(Conjuror.args.options.formats, 'pdf') > -1) {
    console.log(chalk.blue(' - Saving as a PDF'))
    wkhtmltopdf(output_html, {
      pageSize: 'letter',
      output: Conjuror.args.app_path + 'output/' + output_name + '.pdf'
    })
  } else {
    console.log(chalk.red('404 No spell found \nAre you sure you specified an --input -i value'))
  }
}


// Load Data & Parse
Conjuror.Twirl = function(path, resource, client_path, callback) {
  var resource_file = path + '/' + resource.path;

  Conjuror.readManuscript(resource_file)
    .then(function(buffer) {

      var data = buffer.toString("utf8", 0, buffer.length);

      // Loop Through Items
      csv.parse(data, function(err, data) {
        if (err) console.log(err);
        // Load client (pertains to invoicing)
        Conjuror.getClient(client_path, Conjuror.args.options.trim, function(client) {
          if (err){
            console.log(chalk.red("Had a problem with the CSV File: "), err)
          }

          var outputs = Conjuror.magickData(data, resource.schema, Conjuror.args.options.date);
          outputs.client = client;

          // Output CSV - rough implementation https://github.com/bnvk/Conjuror/issues/36
          Conjuror.castToCSV(outputs);

          // This Section is needed if there are "totals"
          // Overwrite outputs.money when we have a fixed price.
          if (Conjuror.args.options.price) {
            outputs.totals.money = +Conjuror.args.options.price
          }

          if (Conjuror.args.options.formats) {
            console.log(chalk.gray('-----------------------------------------------------------------------------'))
            console.log(chalk.green('Output Formats: ' + Conjuror.args.options.formats.join(',')))
          }

          console.log(chalk.gray('-----------------------------------------------------------------------------'))
          console.log(chalk.gray(outputs.cli))
          console.log(chalk.gray('-----------------------------------------------------------------------------'))
          console.log(chalk.green('Total hours worked: ' + outputs.totals.hours))
          console.log(chalk.green('Total monies earned: ' + (Conjuror.args.options.currency || '$') + outputs.totals.money))

          // Get User
          Conjuror.summonUser(function(user_data) {
            if (user_data && user_data.error === undefined) {
              Conjuror.castToHTML(outputs, user_data, resource)
            } else {
              Conjuror.castToHTML(outputs, undefined, resource)
            }
            // return callback for test purposes, and for future func?
            if (callback) return callback()
          })
        })
      });
    }).catch(function(error) {
      console.log(chalk.red("Error while Twirling: "), error)
      if (callback) return callback(Error);
    });
};


// Load Schema
Conjuror.Grow = function(args) {

  Conjuror.args = args;
  var schema_file = args.options.input
  var dataPath = require('path').dirname(schema_file);

  Conjuror.readManuscript(schema_file)
    .then(function(buffer) {
      var json = buffer.toString("utf8", 0, buffer.length);
      var schema = JSON.parse(json);

      console.log(chalk.blue(' - Get item from schema: ' + schema[0].name))

      // If Schema Contains Multiple
      _.each(schema[0].resources, function(resource, key) {

        console.log(chalk.blue(' - Twirl resource: ' + resource.path))
        // Open Data
        Conjuror.Twirl(dataPath, resource, schema[0].clients);

      });
    }).catch(function(error) {
      console.log(chalk.red("Error while growing"), error)
    });
};

module.exports = Conjuror;
