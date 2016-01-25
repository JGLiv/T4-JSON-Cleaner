//jshint esnext:true
//jshint node:true
//jshint mocha:true

'use strict';

var assert = require('assert');
var http=require('http');
var filters=require('../filters');
var main=require('../server');
var request=require('request');


var departments='{Ancient History,Archaeology,Architecture,Chemistry,Classics and Classical Studies,Combined Honours - BA and BSc Programmes,Communication and Media,Computer Science,Dentistry,Diagnostic Radiography,Earth Sciences,Ecology and Marine Biology,Egyptology,Electrical Engineering and Electronics,Engineering,English,Environmental Science,Evolutionary Anthropology,Geography,Geography with Oceanography/Geology,Health Sciences,Heritage Studies,History,Honours Select,Irish Studies,Italian,Law,Life Sciences,Management School,Mathematical Sciences,Medicine,Modern Languages and Cultures,Music,Nursing,Occupational Therapy,Ocean Sciences,Orthoptics,Philosophy,Physics,Physiotherapy,Planning,Politics,Psychology,Radiotherapy,Sociology, Social Policy and Criminology,Veterinary Science,Placeholder}';
var departmentsArrayified='["Ancient History","Archaeology","Architecture","Chemistry","Classics and Classical Studies","Combined Honours - BA and BSc Programmes","Communication and Media","Computer Science","Dentistry","Diagnostic Radiography","Earth Sciences","Ecology and Marine Biology","Egyptology","Electrical Engineering and Electronics","Engineering","English","Environmental Science","Evolutionary Anthropology","Geography","Geography with Oceanography/Geology","Health Sciences","Heritage Studies","History","Honours Select","Irish Studies","Italian","Law","Life Sciences","Management School","Mathematical Sciences","Medicine","Modern Languages and Cultures","Music","Nursing","Occupational Therapy","Ocean Sciences","Orthoptics","Philosophy","Physics","Physiotherapy","Planning","Politics","Psychology","Radiotherapy","Sociology"," Social Policy and Criminology","Veterinary Science","Placeholder"]';
var multiBad='{"abc":{"text":"Hello world"},"bcd":{"text":"Bad text\\\'s"},"a1":{"text":"placeholder"}}';
var multiBadUnescape='{"abc":{"text":"Hello world"},"bcd":{"text":"Bad text\'s"},"a1":{"text":"placeholder"}}';
var multibadUnescapeRemoveEmpty='{"abc":{"text":"Hello world"},"bcd":{"text":"Bad text\'s"}}';


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
  describe("#arrayify()",function(){
    it('Turn {a,b,c} to ["a","b","c"]',function(){
      assert.equal(JSON.stringify(["a","b","c"]),JSON.stringify(filters.arrayify('{a,b,c}')));
      assert.equal(JSON.stringify(["a","b",""]),JSON.stringify(filters.arrayify('{a,b,}')));
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

describe('Server',function(){
  var server=null;
  var remoteServer;
  this.timeout(2000);

  before(function(){
    remoteServer=http.createServer(remote).listen(12348);
    server=main.startServer({port:12349,remote:'http://localhost:12348/'});
  });


  it('Responds with index page when requesting /',function(done){
    request('http://localhost:12349/',(err,res,body)=>{
      if(err){
        done(err);
      }
      assert.equal(200,res.statusCode);
      done();
    });
  });
  it('Responds with index page when requesting /index.html',function(done){
    request('http://localhost:12349/index.html',(err,res,body)=>{
      if(err){
        done(err);
      }
      assert.equal(200,res.statusCode);
      done();
    });
  });
  it('Responds with 404 when requesting a non-existant file',function(done){
    request('http://localhost:12349/404.html',(err,res,body)=>{
      if(err){
        done(err);
      }
      assert.equal(404,res.statusCode);
      done();
    });
  });
  it('Responds with 404 when requesting an existant non-JSON file',function(done){
    request('http://localhost:12349/test.html',function(err,res,body){
      if(err){
        done(err);
      }
      assert.equal(404,res.statusCode);
      done();
    });
  });
  it('Responds with original file when no filters are applied',function(done){
    request('http://localhost:12349/departments.json',function(err,res,body){
      if(err){
        done(err);
      }
      assert.equal(departments,body);
      done();
    });
  });
  it('Responds with array-ify fixed version when requested',function(done){
    request('http://localhost:12349/departments.json?arrayify=true',function(err,res,body){
      if(err){
        done(err);
      }
      assert.equal(departmentsArrayified,body);
      done();
    });
  });
  it('Responds with unescaped version when requested',function(done){
    request('http://localhost:12349/multibad.json?unescape',(err,res,body)=>{
      if(err){
        done(err);
      }
      assert.equal(200,res.statusCode);
      assert.equal(multiBadUnescape,body);
      done();
    });

  });
  it('Responds with original file if filter doesn\'t work',function(done){
    request('http://localhost:12349/multibad.json?removeEmpty',(err,res,body)=>{
      if(err){
        done(err);
      }
      assert.equal(200,res.statusCode);
      assert.equal(multiBad,body);
      done();
    });
  });
  it('Applies filters in internal order',function(done){
    // if it did removeEmpty first, it would fail, but still then do unescape,
    // resulting in valid JSON, but with the placeholder still intact
    request('http://localhost:12349/multibad.json?removeEmpty=a1&unescape',(err,res,body)=>{
      if(err){
        done(err);
      }
      assert.equal(200,res.statusCode);
      assert.equal(multibadUnescapeRemoveEmpty,body);
      done();
    });
  });
  it('Uses default value for removeEmpty',function(done){
    request('http://localhost:12349/multibad.json?removeEmpty&unescape',(err,res,body)=>{
      if(err){
        done(err);
      }
      assert.equal(200,res.statusCode);
      assert.equal(multibadUnescapeRemoveEmpty,body);
      done();
    });
  });
  after(function(){
    server.close();
  });
});

function remote(req,resp)
{
  if(req.url=="/departments.json")
  {
    resp.setHeader('Content-type','application/json');
    resp.statusCode=200;
    resp.end(departments);
    //console.log("Sent departments");
  }else if(req.url=="/multibad.json"){
    resp.setHeader('Content-type','application/json');
    resp.statusCode=200;
    resp.end(multiBad);
  }else if(req.url=="/test.html"){
    resp.statusCode=200;
    resp.setHeader('Content-type','text/html');
    resp.end("<html><body>hi</body></html>");
  }else if(req.url=="json.html"){
    resp.setHeader('Content-type','application/json');
    resp.end(JSON.stringify({response:'ok'}));
  }else{
    resp.responseCode=404;
    resp.setHeader('Content-type','text/html');
    resp.end("No");
  }
}
