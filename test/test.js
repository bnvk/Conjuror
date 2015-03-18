var assert = require("assert");
var Beardo = require("../Beardo");

describe('Beardo', function(){
  describe('summonUser', function(){
    it('should summon a user if there is one in the config', function(done){
      Beardo.summonUser('./test/test_config.json', function(user){
        assert.equal(user.display_name, "Jane Doe");
        done();
      });
    });

    it('should return undefined if there is no user', function(done){
      Beardo.summonUser('./test/no_user.test_config.json', function(user){
        assert.equal(user, undefined);
        done();
      });
    });

    it('should return an error if there is no file', function(done){
      Beardo.summonUser('blah', function(err){
        assert.equal(err.exists, false);
        done();
      });
    });
  });
});
