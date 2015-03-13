var assert = require("assert");
var Beardo = require("../Beardo");

describe('Beardo', function(){
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
