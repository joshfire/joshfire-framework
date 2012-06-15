define(['joshlib!vendor/jquery'], function(dollar) {
  if(typeof window.$ === 'undefined') {
    console.log('$ NOT DEFINED');
    return dollar;
  }

  console.log('$ ALREADY DEFINED');
  return window.$;
});
