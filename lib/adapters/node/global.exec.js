/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 20:23:43 2011
 */

(function(J) {

  var fs = J.nodeRequire('fs');
  var vm = J.nodeRequire('vm');

  var executeJs = function(path) {
    return vm.runInThisContext(fs.readFileSync(path, 'utf8'), path);
  };

  var fileName = process.argv[2];

  if (!fileName) fileName = 'main.js';


  //todo data-main argument ?
  executeJs(fileName);



})(Joshfire);
