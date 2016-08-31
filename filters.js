//jshint esnext:true
//jshint node:true

'use strict';

function removeEmpty(data,id)
{
  id=id||"a1";
  var _data;
  try{
    if(typeof data=="string"){
      _data=JSON.parse(data);
    } else {
      _data=data;
    }
    delete _data[id];
  } catch(e){
    //console.error(e);
    return data;
  }
  return _data;
}

removeEmpty.info="Removes an empty JSON object within an object if placeholders have been added. Usage: /file/to/convert.json?removeEmpty=item to remove 'item' ";

function removeTrailingcomma(data)
{
  try{
    JSON.parse(data);
    return data;
  } catch(e){
    if(e.message.match(/^Unexpected token/))
    {
      var tmp=data.slice(0,data.lastIndexOf(",")).concat(data.slice(data.lastIndexOf(',')+1,data.length));
      return tmp;
    } else {
      return data;
    }
  }
}

removeTrailingcomma.info='Remove a trailing comma from text of JSON to make it valid, e.g. <code>{ "a01234":"test"<b>,</b>}</code> becomes <code>{ "a01234":"test"}</code> which is valid. Usage: /file/to/convert.json?removeTrailingcomma';

function unescape(data)
{
  return data.replace(/\\([^"\\])/g,"$1").replace(/\\\\/g,"\\");
}

unescape.info='Removes invalid character escaping, e.g. \\\' in text. Only \\" is valid in JSON. Usage: /file/to/convert.json?unescape';

function combined(data,id)
{
  try{
    return removeEmpty(JSON.parse(removeTrailingcomma(unescape(data))),id);
  }catch(e){
    return data;
  }
}

combined.info='Performs escape, remoteTrailingcomma and removeEmpty of a given item (See removeEmpty docs). Usage: /file/to/convert.json?combined=blankItem';

function arrayify(data)
{
  return data.replace(/[{}]/g,"").split(",");
}

arrayify.info='Turns comma separated text to an array (doens\'t understand escaping), removes { and } too. Usage: /file/to/convert.json?arrayify';

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
