'use strict'

var _ = require('underscore')
var pkg = require('package')('./')
var path = require('path')
var chalk = require('chalk')
var program = require('commander')


program
  .version(pkg.version)
  .command('setup', 'Process and output a project file')
  .command('project <project>', 'Create a new project file')
  .command('output <project>', 'Outputs data from an project')
  .command('track <project>', 'Add source to existing project')
  .parse(process.argv)

module.exports = Cli
