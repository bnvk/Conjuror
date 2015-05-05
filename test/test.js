var assert = require("assert");
var Conjuror = require("../conjuror");
var moment = require('moment');

describe('Conjuror', function(){

  describe('twirl', function(){
    var config = {
        'path':'test_twirl.csv',
        'schema': {
          'fields': [{
              "name": "date",
              "title": "date when work was performed",
              "type": "date"
            },{
              "name": "time",
              "title": "the amount of time worked. Represent in hours as floating point '8' or '0.5' value",
              "type": "number"
            },{
              "name": "description",
              "title": "description of work performed",
              "type": "string"
            },{
              "name": "client",
              "title": "name of client worked for",
              "type": "string"
            },{
              "name": "location",
              "title": "place where work was performed",
              "type": "string"
            },{
              "name": "rate",
              "title": "the rate to invoice at",
              "type": "number"
            }]
        }
    };
    it('should twirl a resource', function(done){
      Conjuror.Twirl('test', config, function(err){
        assert.equal(err, undefined);
        done();
      });
    });

    it('should return an error if there is no CSV data', function(done){
      Conjuror.Twirl('blah', config, function(err){
        assert.notEqual(err, undefined);
        done();
      });
    });
  });

  describe('date', function(){
    it('should ignore March dates when looking for "Feb"', function() {
      assert.equal(false, Conjuror.Date.month('2015-03-05', 'Feb'));
    });
    it('should accept Feb dates when looking for "Feb"', function() {
      assert.equal(true, Conjuror.Date.month('2015-02-05', 'Feb'));
    });
    it('should accept Feb dates when looking for "02"', function() {
      assert.equal(true, Conjuror.Date.month('2015-02-05', '02'));
    });
    it('should accept full dates ', function() {
      assert.equal(true, Conjuror.Date.full('2015-02-05', '2015-02-05'));
    });
    it('should reject full dates ', function() {
      assert.equal(false, Conjuror.Date.full('2015-02-05', '2015-02-06'));
    });
  });

  describe('magickData', function() {

    // populate some data for this month
    var data_month = [
      [ 'date','time','description','client','location','rate','payment_rate' ],
      [ moment().format('YYYY-MM-DD'),
        '3', 'started tinkering', 'conjuror', 'home', '0.00'],
      [ moment().subtract(2, 'months').format('YYYY-MM-DD'),
        '3', 'started tinkering', 'conjuror', 'home', '0.00'],
      [ moment().add(8, 'days').format('YYYY-MM-DD'),
        '3', 'started tinkering', 'conjuror', 'home', '0.00'],
      [ moment().subtract(2, 'years').format('YYYY-MM-DD'),
        '3', 'started tinkering', 'conjuror', 'home', '0.00']
      ];

    var schema = {
        "fields": [{
            "name": "date",
            "title": "date when work was performed",
            "type": "date"
          },{
            "name": "time",
            "title": "the amount of time worked. Represent in hours as floating point '8' or '0.5' value",
            "type": "number"
          },{
            "name": "description",
            "title": "description of work performed",
            "type": "string"
          },{
            "name": "client",
            "title": "name of client worked for",
            "type": "string"
          },{
            "name": "location",
            "title": "place where work was performed",
            "type": "string"
          },{
            "name": "rate",
            "title": "the rate to invoice at",
            "type": "number"
          }]
    }

    it('should filter by month', function() {
      var outputs = Conjuror.magickData(data_month, schema, 'month');
      assert.equal(6, outputs.totals.hours);
    });

    it('should filter by week', function() {
      var outputs = Conjuror.magickData(data_month, schema, 'week');
      assert.equal(3, outputs.totals.hours);
    });

    it('should filter by month name', function() {
      var outputs = Conjuror.magickData(data_month, schema, moment().format('MMM'));
      assert.equal(6, outputs.totals.hours);
    });

    it('should filter by a year', function() {
      var outputs = Conjuror.magickData(data_month, schema, moment().format('YYYY'));
      assert.equal(9, outputs.totals.hours);
    });
  });

  describe('summonUser', function(){

    // These tests are pending, cause I have no idea how to access or set
    // the args.config variable. Probably a sign that we shouldn't be
    // using it.

    it('should summon a user if there is one in the config');

    it('should return undefined if there is no user');

    it('should return an error if there is no file');
    // , function(done){
    //   Conjuror.summonUser('blah', function(err){
    //     assert.equal(err.exists, false);
    //     done();
    //   });
    // });
  });
});
