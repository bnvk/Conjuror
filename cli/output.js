/** Conjuror - Output
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
Conjuror.recipes = require('../lib/conjuror.recipes.js')
Conjuror.Date = require('../lib/conjuror.date.js')
Conjuror.Trim = require('../lib/conjuror.trim.js')
Conjuror.Search = require('../lib/conjuror.search.js')

// CLI Items
var questions = [{
    type: 'list',
    name: 'input',
    choices: [],
    message: 'Select a project to run a report'
  },{
    type: 'input',
    name: 'output',
    message: 'Name this report',
    default: ''
  },{
    type: 'input',
    name: 'date',
    message: 'Specify date to filter by'
  },{
    type: "input",
    name: "generated",
    message: "What date is this generated on",
    default: 'today'
  },{
    type: 'input',
    name: 'invoicenumber',
    message: 'Does this report have a number',
    default: 0
  },{
    type: "input",
    name: "extra",
    message: "Specify any extra information",
    default: ''
  },{
    type: "list",
    name: "details",
    message: "Would you like to show details of data",
    choices: ['show', 'hide'],
    default: 'show'
  },{
    type: "input",
    name: "message",
    message: "Add an optional message to report"
  },{
    type: 'input',
    name: 'price',
    message: 'Add a fixed price or leave blank to:',
    default: 'tally'
  },{
    type: 'rawlist',
    name: 'currency',
    message: 'What country do you live in',
    choices: ['USD', 'Euro', 'GPB', 'Bitcoin'],
    default: 'USD'
  },{
    type: 'checkbox',
    name: 'formats',
    message: 'Select formats to output this report',
    choices: ['pdf', 'html', 'csv'],
    default: 'pdf'
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
      var app_path = __filename.replace('cli/output.js', '')

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
