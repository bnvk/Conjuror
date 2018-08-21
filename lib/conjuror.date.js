var _ = require('underscore');
var moment = require('moment');

var FilterDate = {};

FilterDate.full = function(date, dateArg) {

  var this_date = date.replace(/-/g,'');
  var filter_date = dateArg.replace(/-/g, '');

  if (this_date >= filter_date) {
    //console.log('this date: 'this_date + ' is greater than filter date: ' + filter_date);
    return true;
  } else {
    return false;
  }
};

FilterDate.year_month = function(date, dateArg) {

  if (date.indexOf(dateArg) > -1) {
    //console.log('date filter by year_month ' + date);
    return true;
  } else {
    return false;
  }
};

FilterDate.month_day = function(date, dateArg) {

  if (date.indexOf(dateArg) > -1) {
    //console.log('date filter by month_day ' + date);
    return true;
  } else {
    return false;
  }
};

FilterDate.year = function(date, dateArg) {

  if (date.indexOf(dateArg) > -1) {
    //console.log('date filter by year ' + date);
    return true;
  } else {
    return false;
  }
};

FilterDate.month = function(date, dateArg) {
  // looks for the month in the supplied arg
  // console.log(date, dateArg)
  var date_trim = dateArg.toLowerCase();
  var date_full = moment(date).format('MMMM').toLowerCase();
  var date_abbr = moment(date).format('MMM').toLowerCase();
  var date_numb = moment(date).format('MM').toLowerCase();

  if (_.indexOf([date_full, date_abbr, date_numb], date_trim) > -1) {
    //console.log('date matches filter: ' + date_trim)
    return true;
  } else {
    return false;
  }
};

FilterDate.today = function(date, dateArg) {
  return moment(date).dayOfYear() == moment().dayOfYear() && moment(date).year() == moment().year()
}

FilterDate.this_week = function(date, dateArg) {
  return moment(date).week() == moment().week() && moment(date).year() == moment().year()
}

FilterDate.this_month = function(date, dateArg) {
  return moment(date).month() == moment().month() && moment(date).year() == moment().year()
}

FilterDate.range = function(date, dateArg) {
  var this_date = date.replace(/-/g,'');
  var date_range = dateArg.split(':to:')

  if (this_date >= date_range[0].replace(/-/g, '') &&
      this_date <= date_range[1].replace(/-/g, '')) {
    return true;
  } else {
    return false;
  }
}

FilterDate.before = function(date, dateArg) {
  var this_date = date.replace(/-/g,'');
  var date_range = dateArg.split('before:')

  if (this_date >= '0000-00-00' &&
      this_date <= date_range[1].replace(/-/g, '')) {
    return true;
  } else {
    return false;
  }
}

FilterDate.none = function(parts) {
  // I uncommented this because it just spouts the same thing over and over
  // again.
  // console.log('no date filtering performed');
};

module.exports = FilterDate;
