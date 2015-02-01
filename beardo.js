var fs      = require("fs"),
    cheerio = require("cheerio"),
    _       = require('underscore'),
    moment  = require('moment'),
    argv    = require('argv');


// Args
argv.option({
    name: 'format',
    short: 'f',
    type: 'csv,string',
    description: 'Defines output formats with csv',
    example: "'script --format=value' or 'script -f value1,value2'"
});

var args = argv.run();
console.log(args.options);


// File Manipulation
var SaveFile = require('./lib/save_file');


// Beardo
var Beardo = {};

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


            // Totals (for tallying)
            var hours = 0;
            // console.log(resource.schema.fields);
            var outputs = {
              cli: '',
              html: ''
            };

            console.log(args.options.format);
            console.log(_.indexOf(args.options.format, 'html'))


            // Loop Through Items
            _.each(lines, function(line, key) {

              // ADD MUCH BETTER CHECKING OF EMPTY LINES
              if (line && line !== undefined) {

                var parts = line.split(',');
                var date  = moment(parts[0]).format('D MMM');
                var hour  = parseInt(parts[1]);
                var desc  = parts[2];
                var client = parts[3];

                // Calculate Totals
                hours += hour;

                // CLI format
                console.log(date + ' ' + hour + 'hrs ' + desc);

                // HTML format
                if (_.indexOf(args.options.format, 'html') > -1) {
                
                  outputs.html += '<tr>\n';
                  outputs.html += '   <td>' + date + '</td>\n';
                  outputs.html += '   <td>' + hour + 'hrs</td>\n';
                  outputs.html += '   <td>' + desc.trim() + '</td>\n';
                  outputs.html += '</tr>\n';

                }

              }
            });

            console.log('-----------------------------------------------------------------------------');
            console.log('hours worked: ' + hours);
            console.log('monies earned: $' + (hours * 60));

            // Output HTML
            if (_.indexOf(args.options.format, 'html') > -1) {


              // Get HTML Template
              var template_path = './html/_template.html';


              fs.exists(template_path, function(exists) {
              	if (exists) {
              		console.log('Beardo loaded template');
                  fs.stat(template_path, function(error, stats) {
                    fs.open(template_path, "r", function(error, fd) {              
                      var buffer = new Buffer(stats.size);
                      fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
                        fs.close(fd);
            
                        var template_file = buffer.toString("utf8", 0, buffer.length);
                        var template_html = _.template(template_file);
                        var output_html   = template_html({ 
                          hours_rows: outputs.html, 
                          hours_total: hours,
                          money_total: (hours * 60)
                        });

                        var saveFile = new SaveFile(fs, 'html/output.html', output_html);
            
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
Beardo.Grow('hours.json');

