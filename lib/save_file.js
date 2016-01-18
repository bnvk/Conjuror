// save_file.js

var chalk = require('chalk')

module.exports = function SaveFile(fs, filename, data) {
	fs.writeFile(filename, data, function (err) {
		if (err) {
      return console.log(chalk.red(err))
    } else {
  		console.log(chalk.blue(' - Saved file: ' + filename))
    }
	})
}
