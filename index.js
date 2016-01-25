//jshint esnext:true
//jshint node:true

'use strict';

const opts=require('commander');
const pkg=require('./package.json');
const serverProvider=require('./server');

opts
  .version(pkg.version)
  .option('-p, --port [8080]','Port to listen on (default: 8080)',parseInt)
  .option('-r, --remote <https://www.mysite.com/>')
  .option('-k, --key [file.p12]',"(optional) .p12 file for ssl key/cert")
  .option('-c, --cred [file.json]','(optional) JSON file with credentials for key/cert')
  .parse(process.argv);

const server=serverProvider.startServer(opts);
