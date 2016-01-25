//jshint esnext:true
//jshint node:true

'use strict';

const opts=require('commander');
const pkg=require('./package.json');
const http=require('http');
const https=require('https');
const path=require('path');
const fs=require('fs');
const filters=require('./filters');
const url=require('url');

opts
  .version(pkg.version)
  .option('-p, --port [8080]','Port to listen on (default: 8080)',parseInt)
  .option('-k, --key [file.p12]',"(optional) .p12 file for ssl key/cert")
  .option('-c, --cred [file.json]','(optional) JSON file with credentials for key/cert')
  .parse(process.argv);


const port=opts.port||8080;
//console.log(`Port:${port}`);

function handler(req,resp) {
  const inUrl=url.parse(req.url,true);
  const file=inUrl.pathname;
  /*try{
    console.log(new Date(),req.connection.remoteAddress,req.header['x-forwarded-for'],file);
  } catch(e){
    console.log(new Date(),req.connection.remoteAddress,null,file);
  }*/
  resp.setHeader("Access-Control-Allow-Origin","*");
  if(file=="/" || file=="/index.html")
  {
    urlGen(req,resp);
    return;
  }
  if(file=="/filters.js")
  {
    console.log("Sending filters");
    fs.createReadStream("./filters.js").pipe(resp);
  }
  const param=inUrl.query;
  https.get("https://www.liverpool.ac.uk"+file,function(res){
    //console.log(res.headers);
    if(!file.match(/\.json$/) && !res.headers["content-type"].match(/json/g)){
      resp.statusCode=404;
      resp.end("JSON files only");
    } else {
      var data="";
      res.on('data', function(chunk){
        data+=chunk.toString();
      });
      res.on('end', function() {
        if(param.combined)
        {
          let origData=data;
          try{
            data=JSON.stringify(filters.combined(data));
          }catch(e){
            data=origData;
          }
        }
        if(param.unescape) {
          let origData=data;
          try{
            data=filters.unescape(data);
          }catch(e){
            data=origData;
          }
        }
        if(param.removeTrailingcomma) {
          let origData=data;
          try{
            data=filters.removeTrailingcomma(data);
          }catch(e){
            data=origData;
          }
        }
        if(param.arrayify) {
          let origData=data;
          try{
            data=JSON.stringify(filters.arrayify(data));
          }catch(e){
            data=origData;
          }
        }
        if(param.removeEmpty) {
          let origData=data;
          try{
            data=JSON.stringify(filters.removeEmpty(JSON.parse(data)));
          }catch(e){
            data=origData;
          }
        }
        //console.log("data",data);
        resp.setHeader("Content-type","application/json");
        resp.end(data);
      });
    }
  });
}

function urlGen(req,resp){
  fs.createReadStream("./index.html").pipe(resp);
}

let server=null;

if(!process.argv[1].match(/mocha/)){ //not running inside test
  if(opts.key && opts.cred){
    console.log("Sarting secure port",port);
    let httpsOptions={pfx:fs.readFileSync("./"+opts.key),passphrase:require("./"+opts.cred).passphrase};
    server=https.createServer(httpsOptions,handler).listen(port);
  }
  else {
    console.log("Starting insecure port",port);
    server=http.createServer(handler).listen(port);
  }
}

module.exports={
  handler:handler,
};
