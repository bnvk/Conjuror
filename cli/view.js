/** Conjuror - Output
 * A CLI interface to output a Conjuror report
 */

"use strict"
var inquirer  = require('inquirer')
var _         = require('underscore')
var chalk     = require('chalk')
var read      = require('datapackage-read')
var moment    = require('moment')

var config = require('../lib/conjuror.config.js')
var Conjuror = require('../lib/conjuror.basic.js')

// Load Conjuror Modules
Conjuror.Recipes = require('../lib/conjuror.recipes.js')
Conjuror.Date = require('../lib/conjuror.date.js')
Conjuror.Trim = require('../lib/conjuror.trim.js')
Conjuror.Search = require('../lib/conjuror.search.js')

// Defaults
var default_date = moment().format('YYYY-MM-01')

// CLI Items
var questions = [{
    type: 'list',
    name: 'input',
    choices: [],
    message: 'Select a project to run a report'
  },{
    type: 'input',
    name: 'date',
    message: 'Specify date to filter by',
    default: default_date
  },{
    type: 'input',
    name: 'trim',
    message: 'Specify a value of a field to filter by'
  },{
    type: 'input',
    name: 'search',
    message: 'Specify a string to search for'
  }
]

// Run CLI
function runOutput() {

  // Check for Input
  Conjuror.getIngredients(config.get_file_path(), function(config) {

    _.each(config.projects, function(project, key) {
      questions[0].choices.push(project.path)
    })

    inquirer.prompt(questions).then(answers => {

      var app_path = __filename.replace('cli/view.js', '')
      var args = {
        targets: [],
        options: answers,
        config: config,
        app_path: app_path
      }

      Conjuror.Grow(args)
    })
  })
}

runOutput()
