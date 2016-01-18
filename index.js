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
  try{
    console.log(new Date(),req.connection.remoteAddress,req.header['x-forwarded-for'],file);
  } catch(e){
    console.log(new Date(),req.connection.remoteAddress,null,file);
  }
  const param=inUrl.query;
  https.get("https://www.liverpool.ac.uk"+file,function(res){
    //console.log(res.headers);
    if(!file.match(/\.json$/) && !res.headers["content-type"].match(/json/g)){
      resp.end("JSON files only");
    } else {
      var data="";
      res.on('data', function(chunk){
        data+=chunk.toString();
      });
      res.on('end', function() {
        if(param.combined)
        {
          data=filters.combined(data);
        }
        if(param.unescape) {
          data=filters.unescape(data);
        }
        if(param.removeTrailingcomma) {
          data=filters.removeTrailingcomma(data);
        }
        if(param.arrayify) {
          data=JSON.stringify(filters.arrayify(data));
        }
        if(param.removeEmpty) {
          data=JSON.stringify(filters.removeEmpty(JSON.parse(data)));
        }
        resp.setHeader("Content-type","application/json");
        resp.end(data);
      });
    }
  });
}

if(opts.key && opts.cred){
  console.log("Sarting secure");
  let httpsOptions={pfx:fs.readFileSync(opts.key),passphrase:require(opts.cred).passphrase};
  let server=https.createServer(httpsOptions,handler).listen(port);
}
else {
  let server=http.createServer(handler).listen(port);
}
