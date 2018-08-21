/** Conjuror - Track
 * A simple lil time tracking CLI for Conjuror
 * run by typing `node track.js` in your console
 */

"use strict"
var fs        = require('fs')
var csv       = require('csv')
var _         = require('underscore')
var chalk     = require('chalk')
var inquirer  = require('inquirer')
var moment    = require('moment')
var read      = require('datapackage-read')

var config = require('../lib/conjuror.config.js')
var Conjuror = require('../lib/conjuror.basic.js')

var tracked_file = ''

// CLI questions
var questions = [{
    type: 'list',
    name: 'date',
    message: 'When did you do this entry?',
    choices: ['today', 'yesterday', 'two days ago', 'three days ago', 'other'],
    filter: function(val) {
      var date = moment();
      if (val === 'yesterday') {
        date = date.subtract(1, 'days')
      }
      else if (val === 'two days ago') {
        date = date.subtract(2, 'days')
      }
      else if (val === 'three days ago') {
        date = date.subtract(3, 'days')
      }
      else if (val === 'other') {
        // TODO: need to add a way to handle alternate
        date = date
      }

      return date.format('YYYY-MM-DD')
    }
  },{
    type: 'input',
    name: 'time',
    message: 'How long did you do this for? 1.5 (hrs)',
    default: '1.00',
    validate: function(value) {
      var valid = !isNaN(parseFloat(value))
      return valid || "Please enter a number"
    }
  },{
    type: 'input',
    name: 'description',
    message: 'Describe what you did during this entry',
    default: 'did some things'
  },{
    type: "list",
    name: "project",
    message: "Choose a project",
    choices: []
  },{
    type: "list",
    name: "location",
    message: "Where did you do this work?",
    choices: []
  },{
    type: "list",
    name: "rate",
    message: "How much are you charging?",
    choices: [],
    validate: function(value) {
      var valid = !isNaN(parseFloat(value))
      return valid || "Please enter a number"
    }
  }
]

function processProjectDetails(csv_data, csv_file) {

  // Examine data
  csv.parse(csv_data, function(error, csvData) {

    if (error) {
      return console.log(chalk.red('Had a problem with the CSV data: '), error)
    }

    // Loop Lines
    _.each(csvData, function(line, index) {

      // skip the first line in empty lines
      if (index !== 0 && line !== undefined && line !== '') {

        // Projects
        if (_.indexOf(questions[3].choices, line[3]) === -1 && line[3]) {
          questions[3].choices.push(line[3])
        }

        // Locations
        if (_.indexOf(questions[4].choices, line[4]) === -1 && line[4]) {
          questions[4].choices.push(line[4])
        }

        // Rates
        if (_.indexOf(questions[5].choices, line[5]) === -1 && line[5]) {
          questions[5].choices.push(line[5])
        }
      }
    })

    // Refine (rate)
    questions[5].choices.sort(function compareNumbers(a, b) {
        return a - b
    })

    // Run CLI
    runApp(csv_file)
  })
}


// Run App
function runApp(csv_file) {

  // Run CLI
  inquirer.prompt(questions).then(answers => {
    // Prepare for CSV
    // TODO: make dynamic based on datapackage spec values
    answers.date        = '"' + answers.date + '"'
    answers.description = '"' + answers.description + '"'
    answers.project     = '"' + answers.project + '"'
    answers.location    = '"' + answers.location + '"'
    var entryData = _.values(answers).join(',') + '\n'

    // Save entry
    fs.appendFile(csv_file, entryData, function(err) {
      if (err) {
        throw err
      }
      console.log(chalk.green('You have tracked the following:\n'))
      console.log(chalk.blue(entryData))
    })
  })
}

// Check for Input
Conjuror.getIngredients(config.get_file_path(), function(config) {

  var project_names = []

  _.each(config.projects, function(project, key) {
    project_names.push(project.name)
  })

  // Ask for project
  inquirer.prompt([{
      type: 'list',
      name: 'input',
      message: 'Which project do you want to track?',
      choices: project_names
    }]).then(answer => {

    tracked_file = _.findWhere(config.projects, { 'name': answer.input }).path

    // Open JSON
    read.load(tracked_file, function(error, json_data) {

      if (error) {
        return console.error(chalk.red('Had a project with opening file'), error)
      }

      Conjuror.readManuscript(json_data.resources[0].url)
        .then(function(buffer) {

          var csv_data = buffer.toString("utf8", 0, buffer.length)
          processProjectDetails(csv_data, json_data.resources[0].url)

        }).catch(function(error) {
          console.log(chalk.red("Error in readManuscript: "), error)
          if (callback) return callback(Error)
        })
    })
  })
})
