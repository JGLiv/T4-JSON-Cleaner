//jshint esnext:true
//jshint node:true

'use strict';

function removeEmpty(data,id)
{
  id=id||"a1";
  try{
    delete data[id];
  } catch(e){

  }
  return data;
}

function removeTrailingcomma(data)
{

}

module.exports={
  removeEmpty:removeEmpty
};
