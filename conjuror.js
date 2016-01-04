var argv          = require('./lib/conjuror.options.js');
var config        = require('./lib/conjuror.config.js');

// Run the imported options.
var args = argv.run();

var Conjuror = require('./lib/conjuror.basic.js');

// Load Conjuror Modules
Conjuror.recipes = require('./lib/conjuror.recipes.js')
Conjuror.Date = require('./lib/conjuror.date.js');
Conjuror.Trim = require('./lib/conjuror.trim.js');
Conjuror.Search = require('./lib/conjuror.search.js');

if (Conjuror.recipes[args.options.recipe] !== undefined) {
  console.log("We're going to", Conjuror.recipes[args.options.recipe].description);
} else {
  // Else Default and Start It Up
  if (args.options.input !== undefined) {

    Conjuror.getIngredients(config.get_file_path(), function(config) {
      // don't really care of the status of config for the moment.
      // let's just supply sensible defaults.
      args.config = config;
      Conjuror.Grow(args.options.input, args);
    });
  } else {
    console.log('404 No spell found \nAre you sure you specified an --input -i value');
  }
}

module.exports = Conjuror;
