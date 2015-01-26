var fs =  require("fs"),
    cheerio = require("cheerio"),
    _ = require('underscore');


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

            var hours = 0;

            // console.log(resource.schema.fields);
            // Tally Numbers
            _.each(lines, function(line, key) {
              if (line !== undefined) {
                hours += parseInt(line.split(',')[1]);
              }
            });

            console.log('hours worked: ' + hours);
            console.log('monies earned: $' + (hours * 60));

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
    
            console.log(schema[0].name);
  
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

