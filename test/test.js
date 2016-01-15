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
  describe('#removeTrailingcomma()',function(){
    it('Remove last comma in file',function(){
      assert.equal('{"a2":{"a":true,"b":false}}',filters.removeTrailingcomma('{"a2":{"a":true,"b":false},}'));
    });
    it('... only if it\'s invalid JSON',function(){
      assert.equal('{"a2":{"a":true,"b":false}}',filters.removeTrailingcomma('{"a2":{"a":true,"b":false}}'));
    });
  });
  describe('#unescape()',function(){
    it('Unescape \\\\ to just \\',function(){
      assert.equal('abc\\cde\\',filters.unescape('abc\\\\cde\\'));
    });
    it('Unescapes \\\' to just \'',function(){
      assert.equal('abc\'def\'',filters.unescape('abc\\\'def\''));
    });
    it('Doesn\'t unescape \\\"',function(){
      assert.equal('abc\\"def',filters.unescape('abc\\"def'));
    });
    it('Cleans up multiple escaped items',function(){
      assert.equal('abc\'def\\"ghi`',filters.unescape('abc\\\'def\\"ghi\`'));
    });
  });
  describe("Combined filters",function(){
    it("Turns bad JSON to good",function(){
      var input='{"a123":{"text":"abc\\"\'"},"a1":{"text":""},}';
      var one=filters.unescape(input);
      var two=filters.removeTrailingcomma(one);
      var three=filters.removeEmpty(JSON.parse(two));
      assert.equal('{"a123":{"text":"abc\\"\'"},"a1":{"text":""},}',one);
      assert.equal('{"a123":{"text":"abc\\"\'"},"a1":{"text":""}}',two);
      assert.equal('{"a123":{"text":"abc\\"\'"}}',JSON.stringify(three));
    });
    it("... automatically",function(){
      var input='{"a123":{"text":"abc\\"\'"},"a1":{"text":""},}';
      var out='{"a123":{"text":"abc\\"\'"}}';
      assert.equal(out,JSON.stringify(filters.combined(input)));
    });
  });
});
