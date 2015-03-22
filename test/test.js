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
