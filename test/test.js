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
    it('should summon a user if there is a schema', function(done){
      Beardo.summonUser('data/user.json', function(err){
        assert.equal(err, undefined);
        done();
      });
    });

    it('should return an error if there is no schema', function(done){
      Beardo.summonUser('blah', function(err){
        assert.notEqual(err, undefined);
        done();
      });
    });
  });
});
