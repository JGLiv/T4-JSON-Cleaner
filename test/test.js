var assert = require('assert');
var filters=require('../filters');

describe('filters', function() {
  describe('#removeEmpty()', function () {
    it('Remove specified empty JSON value', function () {
      assert.equal(JSON.stringify({a1:'test'}), JSON.stringify(filters.removeEmpty({a1:'test',a3:''},"a3")));
    });
    it('Remove default JSON value' ,function(){
      assert.equal(JSON.stringify({a2:'test'}), JSON.stringify(filters.removeEmpty({a2:'test',a1:''})));
    });
    it('Return original object if specified entry doesnt exist',function(){
      assert.equal(JSON.stringify({a2:'test'}), JSON.stringify(filters.removeEmpty({a2:'test'})));
    });
    it('Returns original data, for invalid input',function(){
      assert.equal("invalid",filters.removeEmpty("invalid"));
      assert.equal(1,filters.removeEmpty(1));
    });
  });
});
