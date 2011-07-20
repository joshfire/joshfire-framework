/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jul 20 19:23:09 2011
 */


/*!
* Joshfire Framework 0.9.1
* http://framework.joshfire.com/
*
* Copyright 2011, Joshfire
* Dual licensed under the GPL Version 2 and a Commercial license.
* http://framework.joshfire.com/license
*
* Date: Wed Jul 20 19:18:46 2011
*/


/*!
* Joshfire Framework 0.9.0
* http://framework.joshfire.com/
*
* Copyright 2011, Joshfire
* Dual licensed under the GPL Version 2 and a Commercial license.
* http://framework.joshfire.com/license
*
* Date: Wed Jun 29 16:25:37 2011
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
