var Beardo = Beardo || {};

Beardo.Date = {};

Beardo.Date.full = function(date) {

  var this_date = date.replace(/-/g,'');
  var filter_date = args.options.date.replace(/-/g, '');

  if (this_date >= filter_date) {
    //console.log('this date: 'this_date + ' is greater than filter date: ' + filter_date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.year_month = function(date) {

  if (date.indexOf(args.options.date) > -1) {
    //console.log('date filter by year_month ' + date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.month_day = function(date) {

  if (date.indexOf(args.options.date) > -1) {
    //console.log('date filter by month_day ' + date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.year = function(date) {

  if (date.indexOf(args.options.date) > -1) {
    //console.log('date filter by year ' + date);
    return true;
  } else {
    return false;
  }
};

Beardo.Date.month = function(date) {

  var date_trim = args.options.date.toLowerCase();
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


Beardo.Date.none = function(parts) {
  console.log('no date filtering performed');
};

module.exports = Beardo.Date;
