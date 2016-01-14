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
  try{
    JSON.parse(data);
    return data;
  } catch(e){
    if(e.message=="Unexpected token }")
    {
      console.log("probably trailing comma...");
      var tmp=data.slice(0,data.lastIndexOf(",")).concat(data.slice(data.lastIndexOf(',')+1,data.length));
      return tmp;
    } else {
      return data;
    }
  }

}

module.exports={
  removeEmpty:removeEmpty,
  removeTrailingcomma:removeTrailingcomma
};
