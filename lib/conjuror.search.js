
FilterSearch = function(parts, term) {
  if (term !== undefined) {
    // FIXME: ugly duplication of trim https://github.com/bnvk/Conjuror/issues/35
    var part = parts[2].toLowerCase();
    var search = term.toLowerCase();
    if (part.indexOf(search) > -1) {
      //console.log('description: ' + part + ' | contains: ' + search);
      return true;
    } else {
      return false;
    }
  } else {
    return true;
  }
};

module.exports = FilterSearch;