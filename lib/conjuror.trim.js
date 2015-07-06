var _ = require('underscore');

FilterTrim = function(trim, parts) {
  if (trim !== undefined) {
    var part = parts[3].trim();

    if (_.indexOf(trim, part) > -1) {
      //console.log('client: ' + part + ' matches: ' + args.options.trim);
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

module.exports = FilterTrim;