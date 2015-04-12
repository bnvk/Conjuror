var _       = require('underscore');
var moment  = require('moment');

var Beardo = Beardo || {};

Beardo.Date = {};

Beardo.Date.full = function(date, dateArg) {

  var this_date = date.replace(/-/g,'');
  var filter_date = dateArg.replace(/-/g, '');

  if (this_date >= filter_date) {
    //console.log('this date: 'this_date + ' is greater than filter date: ' + filter_date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.year_month = function(date, dateArg) {

  if (date.indexOf(dateArg) > -1) {
    //console.log('date filter by year_month ' + date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.month_day = function(date, dateArg) {

  if (date.indexOf(dateArg) > -1) {
    //console.log('date filter by month_day ' + date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.year = function(date, dateArg) {

  if (date.indexOf(dateArg) > -1) {
    //console.log('date filter by year ' + date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.month = function(date, dateArg) {
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

Beardo.Date.this_week = function(date, dateArg) {
  return moment(date).week() == moment().week() && moment(date).year() == moment().year()
}

Beardo.Date.this_month = function(date, dateArg) {
  return moment(date).month() == moment().month() && moment(date).year() == moment().year()
}

Beardo.Date.none = function(parts) {
  // I uncommented this because it just spouts the same thing over and over
  // again.
  // console.log('no date filtering performed');
};

module.exports = Beardo.Date;
