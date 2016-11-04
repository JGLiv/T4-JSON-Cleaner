//jshint esnext:true
//jshint node:true

'use strict';

let fs=require('fs');
let url=require('url');
let https=require('https');
let http=require('http');
let request=require('request');
let filters=require('./filters');
let urlJoin=require('url-join');

let options={};
let server=null;

function startServer(opts)
{
  options=opts;
  let port=opts.port||8080;

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


// This is the function used by http or https to respond to web requests.
function handler(req,resp) {
  let inUrl=url.parse(req.url,true);
  let file=inUrl.pathname;

  // let this get used from anywhere.
  resp.setHeader("Access-Control-Allow-Origin","*");
  console.log(req.url);
  // Special rules for the web front-end
  if(file=="/" || file=="/index.html")
  {
    //send the front end page.
    urlGen(req,resp);
    return;
  }
  if(file=="/filters.js")
  {
    fs.createReadStream("./filters.js").pipe(resp);
    return;
  }
  if(file=="/browser.js"){
    fs.createReadStream('./browser.js').pipe(resp);
    return;
  }

  //
  let param=inUrl.query;
  request(urlJoin(options.remote,file),function(err,res,data){
    if(err){
      resp.statusCode=404;
      resp.end(err);
    }
    // check to make sure we're actually working on JSON, and not being asked to retrieve other data.
    if((!file.match(/\.json$/) && !res.headers["content-type"].match(/json/g)) || res.statusCode!==200){
      resp.statusCode=404;
      resp.end("JSON files only");
    } else {

      // Add new filters into this list...

      if(typeof param.combined!=='undefined'){
        let origData=data;
        try{
          data=JSON.stringify(filters.combined(data),param.combined);
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

// build the index pag,e including our base URL.
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
