var fs = require('fs');
var Hapi = require('hapi');
var HapiJsonView = require('hapi-json-view');
var Good = require('good');
var Path = require('path');
var _ = require('underscore');
var Query = require('datapackage-query');

// Create Server
var server = new Hapi.Server();
server.connection({ address: '127.0.0.1', port: 8888 });

server.views({
  engines: {
    json: {
      module: HapiJsonView.create(),
      compileMode: 'async',
      contentType: 'application/json'
    }
  }
})

// API Config
var config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
console.log('Loaded API   config for: ' + config.name);

// JSON Api
server.route({
  method: 'GET',
  path: '/{dataset*}',
  handler: function(request, reply) {

    // If no param, show ToC
    if (!request.params.dataset) {

      var package_path = config.paths.data + config.prefix + config.index;
      var data_path = Path.dirname(package_path + '/datapackage.json');
      console.log('Open: ' + package_path + '/datapackage.json');

      Query.Grow(package_path + '/datapackage.json', function(schema) {

        // Open CSV Data
        Query.Twirl(data_path, schema.resources[0], request.url.query, function(csv_to_json_data) {

          var response = _.omit(schema, 'resources');
          response['status'] = 'success';
          response['result'] = csv_to_json_data;

          // Render
          reply(response);
         });
      });
    }
    else if (_.indexOf(config.datasets, request.params.dataset) > -1) {

      var package_path = config.paths.data + config.prefix + request.params.dataset;
      var data_path = Path.dirname(package_path + '/datapackage.json');
      console.log('Open: ' + package_path + '/datapackage.json');

      Query.Grow(package_path + '/datapackage.json', function(schema) {

        // If Schema Contains Multiple
        _.each(schema.resources, function(resource, key) {

          // Open CSV Data
           Query.Twirl(data_path, resource, request.url.query, function(csv_to_json_data) {

            var response = _.omit(schema, 'resources');
            response['status'] = 'success';
            response['result'] = csv_to_json_data;

            // Render
            reply(response);
           });

        });

      });
    } else {
      // Show Error
      reply({
        status: 'error',
        name: 'Shucks there is no dataset called [' + request.params.dataset + ']'
      });
    }
  }
});


// Good Logging
server.register({
  register: Good,
  options: {
    reporters: [{
        reporter: require('good-console'),
        args:[{ log: '*', response: '*' }]
    }]
  }
}, function (err) {
  if (err) {
    throw err; // something bad happened loading the plugin
  }

  // Start
  server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});
