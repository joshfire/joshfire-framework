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

Joshfire.require(['joshfire/class', 'joshfire/tree.ui', 'joshfire/app', 'joshfire/vendor/jquery'], function(Class, UITree, App, $) {


  var dynamicCounter = 0;

  //Joshfire.debug = true;
  var testApp = new Class(App, {

    id: 'testHtmlClass',

    dataTree: [{
      id: 'static',
      children: [
        {
          'id': 'static1'
        },
        {
          'id': 'static2'
        },
        {
          'id': 'static3'
        }
      ]
    }
    ],

    uiTree: [{
      id: 'listStatic1',
      htmlId: 'htmlIdTest',
      htmlClass: 'htmlClassTest',
      type: 'list',
      dataPath: '/static'
    },
    {
      id: 'listStatic2',
      type: 'list',
      dataPath: '/static'
    }
    ]

  });

  module('htmlClasses and Ids');

  test('htmlClass', function() {
    expect(15);

    var app = new testApp({});

    stop();

    setTimeout(function() {

      equals('htmlIdTest', app.ui.element('/listStatic1').getHtmlId());

      ok(app.ui.element('/listStatic1').hasHtmlClass('htmlClassTest'));

      ok($('#htmlIdTest')[0].className.match(/htmlClassTest/));

      app.ui.element('/listStatic1').addHtmlClass('CLASSTeST');
      ok(app.ui.element('/listStatic1').hasHtmlClass('CLASSTeST'));
      ok($('#htmlIdTest')[0].className.match(/CLASSTeST/));

      app.ui.element('/listStatic1').toggleHtmlClass('CLASSTeST');

      ok(!$('#htmlIdTest')[0].className.match(/CLASSTeST/));
      ok(!app.ui.element('/listStatic1').hasHtmlClass('CLASSTeST'));

      app.ui.element('/listStatic1').toggleHtmlClass('CLASSTeST');

      ok(app.ui.element('/listStatic1').hasHtmlClass('CLASSTeST'));
      ok($('#htmlIdTest')[0].className.match(/CLASSTeST/));


      equals('htmlIdTest', app.ui.element('/listStatic1').getHtmlId());

      ok(app.ui.element('/listStatic1').hasHtmlClass('htmlClassTest'));

      ok($('#htmlIdTest')[0].className.match(/htmlClassTest/));


      equals('htmlIdTest', app.ui.element('/listStatic1').getHtmlId());

      ok(app.ui.element('/listStatic1').hasHtmlClass('htmlClassTest'));

      ok($('#htmlIdTest')[0].className.match(/htmlClassTest/));


      start();
    },
    500);

  });


  start();

}
);
