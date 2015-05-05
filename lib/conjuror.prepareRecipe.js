var Promise = require('es6-promise').Promise;
var fs      = require("fs");
var _       = require('underscore');
var moment  = require('moment');

// All the functions that have to do with preparing the
// eventual spell that gets cast. This involves functions for
// reading data files, reading data lines, etc. Try to keep
// the spell logic out of this file.

Beardo = {};

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
};

Beardo.readManuscript = function(file_path) {
  // A generic function for reading a json or csv resource
  // file. It returns a promise, which rejects with an error
  // or returns the Buffer of the loaded file at file_path
  return new Promise(function(resolve, reject) {
    fs.exists(file_path, function(exists) {
      if (exists) {
        fs.stat(file_path, function(error, stats) {
          fs.open(file_path, "r", function(error, fd) {

            var buffer = new Buffer(stats.size);

            fs.read(fd, buffer, 0, buffer.length, null, function(error, bytesRead, buffer) {
              fs.close(fd);

              resolve(buffer);

            });

          });
        });
      } else {
        reject(Error('awwww no schema'));
      }
    })
  })
};

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

module.exports = Beardo;
