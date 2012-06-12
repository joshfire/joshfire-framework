define([], function(){
  /*
  Spinned off reqwest
  */return (function(){
  return function (url, callback){
    var head=document.getElementsByTagName('head')[0],
      script = document.createElement('script')
    , loaded = false;

  script.type = 'text/javascript';
  script.src = url;
  script.async=true;
  if (typeof script.onreadystatechange !== 'undefined') {
      // need this for IE due to out-of-order onreadystatechange(), binding script
      // execution to an event listener gives us control over when the script
      // is executed. See http://jaubourg.net/2010/07/loading-script-as-onclick-handler-of.html
      script.event = 'onclick';
  }
  

  script.onload = script.onreadystatechange = function () {
    if ( (script.readyState && script.readyState !== "complete" && script.readyState !== "loaded") || loaded) {
      return false;
    }
    script.onload = script.onreadystatechange = null;
    script.onclick && script.onclick();
    callback &&callback();
    head.removeChild(script);
    loaded=true;
    return true;
  };
  head.appendChild(script);
};
})();
});