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

    id: 'testDatapath',

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
    },
    {
      id: 'dynamic',
      children: function(query, callback) {
        dynamicCounter++;
        setTimeout(function() {
                        callback(null, [{
            'id': 'dynamic1'
                        },
                        {
            'id': 'dynamic2'
                        },
                        {
            'id': 'dynamic3'
                        }]);
        },
        200);
      }
    }
    ],

    uiTree: [{
      id: 'listStatic1',
      type: 'list',
      dataPath: '/static'
    },
    {
      id: 'listStatic2',
      type: 'list',
      dataPath: '/static'
    },
    {
      id: 'listDynamic1',
      type: 'list',
      dataPath: '/dynamic'
    },
    {
      id: 'listDynamic2',
      type: 'list',
      dataPath: '/dynamic'
    }
    ]

  });

  module('dataPath and lists');

  test('dataPath', function() {
    expect(8);


    equals(0, dynamicCounter);

    var app = new testApp({});

    stop();

    setTimeout(function() {

      equals(1, dynamicCounter);

      equals(1, $('#testDatapath__').length);
      equals(3, $('#testDatapath__listStatic1 li').length);
      equals(3, $('#testDatapath__listStatic2 li').length);
      equals(3, $('#testDatapath__listDynamic1 li').length);
      equals(3, $('#testDatapath__listDynamic2 li').length);

      equals('testDatapath__listDynamic2_dynamic3', $('#testDatapath__listDynamic2 li')[2].id);


      start();
    },
    500);

  });


  start();

}
);
