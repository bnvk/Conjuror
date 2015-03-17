// save_file.js
module.exports = function SaveFile(fs, filename, data) {

	// Write it
	fs.writeFile(filename, data, function (err) {
		if (err) {
      return console.log(err);
    } else {
  		console.log('Saved or updated HTML file');
    }
	});

};