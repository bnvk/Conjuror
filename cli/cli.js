// #!/usr/bin/env node

var fs        = require('fs')
var program   = require('commander')
var inquirer  = require('inquirer')
var _         = require('underscore')
var chalk     = require('chalk')
var read      = require('datapackage-read')

// Conjuror Basics
var config    = require('../lib/conjuror.config')
var Conjuror = require('../lib/conjuror.basic.js')

// Conjuror Modules
Conjuror.Recipes = require('../lib/conjuror.recipes.js')
Conjuror.Date = require('../lib/conjuror.date.js')
Conjuror.Trim = require('../lib/conjuror.trim.js')
Conjuror.Search = require('../lib/conjuror.search.js')

var executed = false

program
  .command('setup') // [env]')
  .description('Sets up Conjuror on a machine')
  //.option("-s, --setup_mode [mode]", "Which setup mode to use")
  .action(function(env, options) {

    //var mode = options.setup_mode || "normal";
    executed = true
    //env = env || 'all';
    //console.log('setup for %s env(s) with %s mode', env, mode);
    console.log(chalk.blue(' - Conjuror is running Setup'))
    var setup = require('./setup')
  })

program
  .command('view')
  .description('Views entries in a dataset')
  .action(function(cmd, options) {

    executed = true
    console.log(chalk.blue(' - Conjuror is running View'))
    var view = require('./view')
  })

program
  .command('track')
  .description('Records an entry into a dataset')
  .action(function(cmd, options) {

    executed = true
    console.log(chalk.blue(' - Conjurror is running Track'))
    var track = require('./track')
  })

program
  .command('output')
  .description('Outputs filtered data to PDF, HTML, CSV')
  .action(function(cmd, options) {

    executed = true
    console.log(chalk.blue('- Conjuror is running Output'))
    var output = require('./output')
  })


// Run Program
program.parse(process.argv)

// Show help if no arg / bad arg is called
if (!executed) {
    program.help()
}
