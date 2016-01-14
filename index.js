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
  .option('-k, --key [file]',"(optional) private key")
  .option('-c, --cert [file]','(optional) SSL certificate + chain')
  .parse(process.argv);

const port=opts.port||8080;
//console.log(`Port:${port}`);

function handler(req,resp) {
  const inUrl=url.parse(req.url,true);
}

if(opts.key && opts.cert){
  let server=https.createServer({key: fs.readFileSync(opts.key),cert: fs.readFileSync(opts.cert)},handler).listen(port);
}
else {
  let server=http.createServer(handler).listen(port);
}
