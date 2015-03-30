var assert = require("assert");
var Beardo = require("../Beardo");

describe('Beardo', function(){

  describe('twirl', function(){
    it('should twirl a resource', function(done){
      Beardo.Twirl('test', 'test_twirl.csv', function(err){
        assert.equal(err, undefined);
        done();
      });
    });

    it('should return an error if there is no CSV data', function(done){
      Beardo.Twirl('blah', 'blah', function(err){
        assert.notEqual(err, undefined);
        done();
      });
    });

  });

  describe('date', function(){
    it('should ignore March dates when looking for "Feb"', function() {
      assert.equal(false, Beardo.Date.month('2015-03-05', 'Feb'));
    });
    it('should accept Feb dates when looking for "Feb"', function() {
      assert.equal(true, Beardo.Date.month('2015-02-05', 'Feb'));
    });
    it('should accept Feb dates when looking for "02"', function() {
      assert.equal(true, Beardo.Date.month('2015-02-05', '02'));
    });
    it('should accept full dates ', function() {
      assert.equal(true, Beardo.Date.full('2015-02-05', '2015-02-05'));
    });
    it('should reject full dates ', function() {
      assert.equal(false, Beardo.Date.full('2015-02-05', '2015-02-06'));
    });
  });

  describe('summonUser', function(){

    // These tests are pending, cause I have no idea how to access or set
    // the args.config variable. Probably a sign that we shouldn't be
    // using it.

    it('should summon a user if there is one in the config')

    it('should return undefined if there is no user')

    it('should return an error if there is no file')
    // , function(done){
    //   Beardo.summonUser('blah', function(err){
    //     assert.equal(err.exists, false);
    //     done();
    //   });
    // });
  });
});
