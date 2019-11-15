/** Conjuror - Setup
 * sets up an instance of Conjuror on a local computer via CLI
 */

"use strict"
var fs        = require("fs")
var _         = require('underscore')
var inquirer  = require("inquirer")
var mkdirp    = require('mkdirp')
var chalk     = require('chalk')

var config    = require('../lib/conjuror.config.js')

// CLI Questions
var questions = [{
    type: 'input',
    name: 'display_name',
    message: 'What is your name?',
    default: 'Merlin'
  },{
    type: 'input',
    name: 'address',
    message: 'What is your address?',
    default: '457 Magic Woods Ln.'
  },{
    type: 'input',
    name: 'city_state',
    message: 'What is your city and postal code?',
    default: 'Sherwood, NW463'
  },{
    type: 'input',
    name: 'country',
    message: 'What country do you live in?',
    default: 'England'
  },{
    type: "input",
    name: "email",
    message: "What is your email address?",
    default: 'merlin@magic-lab.org'
  },{
    type: "input",
    name: "website",
    message: "Where on the world wide web do you call home?",
    default: 'https://magic-lab.org'
  },{
    type: "input",
    name: "invoice_count",
    message: "Start invoice numbers at",
    default: '00000'
  }
]

// Run Setup
function runSetup() {

  // Run CLI
  inquirer.prompt(questions).then(answers => {
    var config_data = {
      'default_template': 'invoice',
      'user': answers
    }

    // Save Config
    fs.appendFile(config.get_file_path(), JSON.stringify(config_data), function (err) {
      if (err) throw err
      console.log(chalk.green('Created config file'))
      console.log(config_data)
    })
  })
}

// Check if config exists
fs.exists(config.get_file_path(), function(exists) {
  if (exists) {
    console.log(chalk.red('Shazzam there is already a config file'))
  } else {
    mkdirp(config.get_path(), function (err) {
      runSetup()
    })
  }
})
