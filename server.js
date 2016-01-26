//jshint esnext:true
//jshint node:true

'use strict';

const fs=require('fs');
const url=require('url');
const https=require('https');
const http=require('http');
const request=require('request');
const filters=require('./filters');
const urlJoin=require('url-join');

let options={};
let server=null;

function startServer(opts)
{
  options=opts;
  const port=opts.port||8080;
//  options.remote=options.remote||"https://www.liverpool.ac.uk/";

  if(opts.key && opts.cred){
    console.log("Sarting secure port",port);
    let httpsOptions={pfx:fs.readFileSync("./"+opts.key),passphrase:require("./"+opts.cred).passphrase};
    server=https.createServer(httpsOptions,handler).listen(port);
    return server;
  }
  else {
    console.log("Starting insecure port",port);
    server=http.createServer(handler).listen(port);
    return server;
  }
}

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
    fs.createReadStream("./filters.js").pipe(resp);
  }
  if(file=="/browser.js"){
    fs.createReadStream('./browser.js').pipe(resp);
  }
  const param=inUrl.query;
  request(urlJoin(options.remote,file),function(err,res,data){
    if(err){
      resp.statusCode=404;
      resp.end(err);
    }
    if((!file.match(/\.json$/) && !res.headers["content-type"].match(/json/g)) || res.statusCode!==200){
      resp.statusCode=404;
      resp.end("JSON files only");
    } else {
      if(typeof param.combined!=='undefined'){
        let origData=data;
        try{
          data=JSON.stringify(filters.combined(data));
        }catch(e){
          data=origData;
        }
      }
      if(typeof param.unescape!=='undefined') {
        let origData=data;
        try{
          data=filters.unescape(data);
        }catch(e){
          data=origData;
        }
      }
      if(typeof param.removeTrailingcomma!=='undefined') {
        let origData=data;
        try{
          data=filters.removeTrailingcomma(data);
        }catch(e){
          data=origData;
        }
      }
      if(typeof param.arrayify!=='undefined'){
        let origData=data;
        try{
          data=JSON.stringify(filters.arrayify(data));
        }catch(e){
          data=origData;
        }
      }
      if(typeof param.removeEmpty!=='undefined'){
        let origData=data;
        try{
          data=JSON.stringify(filters.removeEmpty(JSON.parse(data),param.removeEmpty));
        }catch(e){
          data=origData;
        }
      }
      resp.setHeader("Content-type","application/json");
      resp.end(data);
    }
  });
}

function urlGen(req,resp){
  fs.readFile("./index.html",function(err,data){
    data=data.toString().replace(/#base#/g,urlJoin(options.remote,"/"));
    resp.end(data);
  });
}

module.exports={
  startServer:startServer,
  handler:handler
};
