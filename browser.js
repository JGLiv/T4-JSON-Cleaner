//jshint browser:true
//jshint devel:true

function fetch(url)
{
  removeClass(document.querySelector("#step2"),"hidden");
  addClass(document.getElementById('step2'),"hidden");
  var request = new XMLHttpRequest();
  request.open('GET', url, true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      window.origData=request.responseText;
      try{
        JSON.parse(request.responseText);
        console.log("Good JSON");
        document.getElementById('output').innerHTML=location.href+url;
        removeClass(document.getElementById('step9'),"hidden");
      }catch(e){
        err("Invalid JSON! \"<code>"+e.message+"</code>\"",request.responseText);
        removeClass(document.querySelector("#step2"),"hidden");
      }
    } else {
      err("Unable to retrieve file","Status code: "+request.status+"\n"+request.responseText);
      removeClass(document.querySelector("#step2"),"hidden");
    }
  };

  request.onerror = function() {
    err("Unable to connect to server","No data");
  };
  request.send();
}

function err(msg,data)
{
  document.querySelector("#jsonout").innerHTML="<div>"+msg+"</div><br/><div><code>"+data+"</code></div>";
}

function removeClass(el,cl)
{
  if (el.classList)
    el.classList.remove(cl);
  else
    el.cl = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
}

function addClass(el,cl)
{
  if (el.classList)
    el.classList.add(cl);
  else
    el.className += ' ' + cl;
}

function testFilters()
{

}
