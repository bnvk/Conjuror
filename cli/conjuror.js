'use strict'

var _ = require('underscore')
var pkg = require('package')('./')
var path = require('path')
var chalk = require('chalk')
var program = require('commander')


program
  .version(pkg.version)
  .command('import <dir>', 'Create a new project file')
  .command('run <project>', 'Open an existing project file')
  .command('track <project>', 'Add source to existing project')
  .command('setup <project>', 'Process and output a project file')
  .parse(process.argv)

module.exports = Cli
