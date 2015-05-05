// save_file.js
module.exports = function SaveFile(fs, filename, data) {
  console.log("writing");
	// Write it

	fs.writeFile(filename, data, function (err) {
		if (err) {
      return console.log(err);
    } else {
  		console.log('Saved or updated HTML file');
    }
	});

};
