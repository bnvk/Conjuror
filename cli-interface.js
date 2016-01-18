// #!/usr/bin/env node

var fs        = require("fs")
var program   = require('commander')
var inquirer  = require('inquirer')


// Conjuror Modules
var config    = require('./lib/conjuror.config')

var Conjuror = require('./lib/conjuror.prepareRecipe')

var setup     = require('./lib/setup')
var track     = require('./lib/conjuror.track')


var executed = false


program
  .command('setup') // [env]')
  .description('run the setup for Conjuror')
  .option("-s, --setup_mode [mode]", "Which setup mode to use")
  .action(function(env, options) {
//  var mode = options.setup_mode || "normal";

    executed = true
    //env = env || 'all';
    //console.log('setup for %s env(s) with %s mode', env, mode);

    // Check if config exists
    fs.exists(config.get_file_path(), function(exists) {
      if (exists) {
        console.log('Shazzam, you are already setup')
      } else {
        setup.runSetup()
      }
    })

  })

program
  .command('track')
  .description('track some time spent or other value')
  .action(function(cmd, options) {

    executed = true

    Conjuror.getIngredients(config.get_file_path(), function(config) {

      track.chooseSet(config)

    })

  })


// Run Program
program.parse(process.argv)

// Show help if no arg / bad arg is called
if (!executed) {
    program.help()
}
