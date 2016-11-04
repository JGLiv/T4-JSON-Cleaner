#!/usr/bin/env node

//jshint esnext:true
//jshint node:true

'use strict';

let opts=require('commander');
let pkg=require('./package.json');
let serverProvider=require('./server');

process.on('uncaughtException',function(e)
{
  console.error("UNCAUGHT EXCEPTION",e,e.stackTrace);
});

opts
  .version(pkg.version)
  .option('-p, --port [8080]','Port to listen on (default: 8080)',parseInt)
  .option('-r, --remote <https://www.mysite.com/>')
  .option('-k, --key [file.p12]',"(optional) .p12 file for ssl key/cert")
  .option('-c, --cred [file.json]','(optional) JSON file with credentials for key/cert')
  .parse(process.argv);

let server=serverProvider.startServer(opts);
