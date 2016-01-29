//jshint esnext:true
//jshint node:true

'use strict';

function removeEmpty(data,id)
{
  id=id||"a1";
  try{
    delete data[id];
  } catch(e){
    console.error(e);
  }
  return data;
}

function removeTrailingcomma(data)
{
  try{
    JSON.parse(data);
    return data;
  } catch(e){
    if(e.message=="Unexpected token }")
    {
      var tmp=data.slice(0,data.lastIndexOf(",")).concat(data.slice(data.lastIndexOf(',')+1,data.length));
      return tmp;
    } else {
      return data;
    }
  }
}

function unescape(data)
{
  return data.replace(/\\([^"\\])/g,"$1").replace(/\\\\/g,"\\");
}

function combined(data)
{
  try{
    return removeEmpty(JSON.parse(removeTrailingcomma(unescape(data))));
  }catch(e){
    return data;
  }
}

function arrayify(data)
{
  return data.replace(/[{}]/g,"").split(",");
}

if(typeof module == "undefined"){
  var module={}; //jshint ignore:line
}

module.exports={
  removeEmpty:removeEmpty,
  removeTrailingcomma:removeTrailingcomma,
  unescape:unescape,
  combined:combined,
  arrayify:arrayify
};
