var fs      = require("fs"),
    cheerio = require("cheerio"),
    _       = require('underscore'),
    moment  = require('moment'),
    argv    = require('argv');


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


Beardo.Date = function(parts) {
  if (args.options.date !== undefined) {

    var date_trim = args.options.date.toLowerCase();
    var date_full = moment(parts[0]).format('MMMM').toLowerCase();
    var date_abbr = moment(parts[0]).format('MMM').toLowerCase();
    var date_numb = moment(parts[0]).format('MM').toLowerCase();

    if (_.indexOf([date_full, date_abbr, date_numb], date_trim) > -1) {
      //console.log('date matches filter: ' + date_trim)
      return true;
    } else {
      return false;
    }
  } else { 
    return true;
  }
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
Beardo.Twirl = function(resource) {

  fs.exists(resource.path, function(exists) {
  	if (exists) {

  		console.log('Beardo is twirling some data');
  
      fs.stat(resource.path, function(error, stats) {
        fs.open(resource.path, "r", function(error, fd) {
  
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

              outputs.totals.hours += item.hour;
              outputs.totals.money += (item.hour * 60);

              // CLI format
              outputs.cli += item.date + ' ' + item.hour + ' \t' + item.client + ' \t' + item.desc + '\n';

              // HTML format
              if (_.indexOf(args.options.format, 'html') > -1) {          
                outputs.html += '<tr>\n';
                outputs.html += '   <td>' + item.date + '</td>\n';
                outputs.html += '   <td class="text-right">' + item.hour + '</td>\n';
                outputs.html += '   <td class="text-left"> hrs</td>\n';
                outputs.html += '   <td>' + item.desc + '</td>\n';
                outputs.html += '</tr>\n';
              }
            };


            // Loop Through Items
            _.each(lines, function(line, key) {

              // FIXME: ADD MUCH BETTER CHECKING OF EMPTY LINES
              if (line && line !== undefined) {

                var parts = line.split(',');

                // Should Filter?
                var check_date = Beardo.Date(parts);
                var check_trim = Beardo.Trim(parts);

                if (_.indexOf([check_date, check_trim], false) === -1) {

                  var item_output = {
                    date: moment(parts[0]).format('D MMM'),
                    hour: parseFloat(parts[1]),
                    desc: parts[2].trim(),
                    client: parts[3].trim()
                  }

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
            console.log('monies earned: $' + outputs.totals.money);

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
  
      fs.stat(schema_file, function(error, stats) {
        fs.open(schema_file, "r", function(error, fd) {
  
          var buffer = new Buffer(stats.size);
  
          fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
            fs.close(fd);
  
            var json = buffer.toString("utf8", 0, buffer.length);
            var schema = JSON.parse(json);
    
            console.log('Get item from schema: ' + schema[0].name);
  
            _.each(schema[0].resources, function(resource, key) {

              console.log('Twirl resouce: ' + resource.path);

              // Open Data
              Beardo.Twirl(resource);

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

