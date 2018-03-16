/** Conjuror - New
 * A CLI interface to output a Conjuror report
 */

"use strict"
var inquirer  = require('inquirer')
var _         = require('underscore')
var chalk     = require('chalk')
var read      = require('datapackage-read')

var config = require('../lib/conjuror.config.js')
var Conjuror = require('../lib/conjuror.basic.js')

// Load Conjuror Modules
Conjuror.Recipes = require('../lib/conjuror.recipes.js')

// CLI Items
var questions = [{
    type: 'input',
    name: 'title',
    message: 'Name this project',
    default: 'Magic Potions'
  },{
    type: 'input',
    name: 'description',
    message: 'Describe this project',
    default: 'Ingredients for magic spell...'
  },{
    type: 'list',
    name: 'schema',
    choices: ['A Recipe', 'Single CSV File', 'Scan Folder'],
    message: 'Generate project schema from'
  },{
    type: 'list',
    name: 'license',
    choices: ['PDDL-1.0', 'ODC-1.0', 'ODB-1.0'],
    message: 'How would you like to license this data'
  },{
    type: 'list',
    name: 'publish',
    choices: ['yes', 'no'],
    message: 'Publish this data with data.okfn.org registery'
  }
]

// Run CLI
function runNew() {

  // Check for Input
  Conjuror.getIngredients(config.get_file_path(), function(config) {

    inquirer.prompt(questions).then(answers => {

      var app_path = __filename.replace('cli/new.js', '')

      var args = {
        targets: [],
        options: answers,
        config: config,
        app_path: app_path
      }

      // Create new datapackage call
    })
  })
}

runNew()
