var Config = {
  path: '.conjuror',
  file: 'config.json'
}

Config.get_user_home = function() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
}

Config.get_path = function() {
  return this.get_user_home() + '/' + this.path + '/'
}

Config.get_file_path = function() {
  return this.get_user_home() + '/' + this.path + '/' + this.file
}

Config.new_invoice_count = function(number) {
  var num_string = "0000" + number
  return num_string.substr(num_string.length - 5)
}

module.exports = Config
