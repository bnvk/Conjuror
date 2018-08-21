var chalk   = require('chalk')
var fs      = require("fs")
var _       = require('underscore')
var moment  = require('moment')
var csv     = require('csv')

// All the functions that have to do with preparing the
// eventual spell that gets cast. This involves functions for
// reading data files, reading data lines, etc. Try to keep
// the spell logic out of this file.
Conjuror = {}

Conjuror.getIngredients = function(config_file, callback) {
  // Finds the config file if it exists.
  Conjuror.readManuscript(config_file)
    .then(function(buffer) {
      var config = JSON.parse(buffer)
      return callback(config)
    }).catch(function(error) {
      console.log(chalk.red('You don\'t have a config file. Run "node setup.js" to create one'))
      return callback({'exists': exists})
    })
}

Conjuror.readManuscript = function(file_path) {
  // Generic function for reading JSON or CSV files which returns a Promise,
  // which rejects with an error or returns the Buffer of the loaded file
  return new Promise(function(resolve, reject) {
    fs.exists(file_path, function(exists) {
      if (exists) {
        fs.readFile(file_path, (err, data) => {
          if (err) throw err;
          resolve(data)
        })
      } else {
        reject(Error('awwww no such file'))
      }
    })
  })
}

Conjuror.readData = function(schema_file, callback) {
  // TODO: this is nested and mostly repeated in Twirl,
  // good target for refactoring takes in a schema file and returns CSV data
  var dataPath = require('path').dirname(schema_file)

  Conjuror.readManuscript(schema_file)
    .then(function(buffer) {

      var clients_json = JSON.parse(buffer);
      // Doing this in a loop should be where we need to figure out something
      Conjuror.readManuscript(dataPath + '/' + clients_json[0].resources[0].path)
        .then(function(buffer) {

          var data = buffer.toString("utf8", 0, buffer.length)

          csv.parse(data, function(err, data) {
            if (err) {
              reject(err)
            }
            return callback({
                'schema': clients_json[0].resources[0].schema,
                'data': data
              })
          })
        }).catch(function(error) {
          console.log(chalk.red("Error while reading JSON manuscript", error))
          return callback(error)
      })
  }).catch(function(error) {
    console.log(chalk.red("Error while reading file", error))
    return callback(error)
  })
}

Conjuror.murmurLineToSchema = function(parts, schema, fields) {
  // line is the line being processed, schema is the schema provided in the
  // resource, fields is the fields required in the output, if blank it
  // defaults to everything in the schema.
  if (parts !== undefined) {
    var lineItem = {}
    _.each(schema.fields, function(field, index) {
      if (fields === undefined || fields.indexOf(field.name) !== -1) {
        var parsed

        if (field.type === 'date') {
          parsed = moment(parts[index]).format('D MMM')
        }

        if (field.type === 'number') {
          parsed = parseFloat(parts[index])
        }

        if (field.type === 'string') {
          parsed = parts[index].trim()
        }

        if (field.type === 'boolean'){
          parsed = parts[index]
          if (parsed === 'yes') parsed = true
          else if (parsed === 'no') parse = false
        }

        // For Output
        lineItem[field.name] = parsed
      }
    });
    return lineItem
  } else {
    return {}
  }
}

module.exports = Conjuror
