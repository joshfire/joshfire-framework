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

var Q = QUnit;

Q.config.autostart = false;
Joshfire.debug = true;

module('Utils / DataSource');

Joshfire.define(['joshfire/utils/datasource'], function(DataSource) {
  test('general test', function() {
    expect(3);
    stop();
    var ds = new DataSource();
    ds.request({'url': 'http://www.whattimeisit.com/'},function(err,page1) {
      ok(page1.indexOf('Coordinated Universal Time') > 0);
      setTimeout(function() {
        ds.request({'url': 'http://www.whattimeisit.com/'},function(err,page2) {
          ok(page2.indexOf('Coordinated Universal Time') > 0);
          ok(page1 != page2);
          start();
        });
      },2000);
    });
  });

  test('cache test', function() {
    expect(5);
    stop();
    var ds = new DataSource();
    ds.request({'url': 'http://www.whattimeisit.com/', 'cache': 3},function(err,page1) {
      ok(page1.indexOf('Coordinated Universal Time') > 0);
      setTimeout(function() {
        ds.request({'url': 'http://www.whattimeisit.com/', 'cache': 3},function(err,page2) {
          ok(page2.indexOf('Coordinated Universal Time') > 0);
          ok(page1 == page2);
          setTimeout(function() {
            //Cache should now be expired
            ds.request({'url': 'http://www.whattimeisit.com/', 'cache': 3},function(err,page3) {
              ok(page1.indexOf('Coordinated Universal Time') > 0);
              ok(page1 != page3);
              start();
            });
          },2000);
        });
      },2000);
    });
  });

  start();
});
