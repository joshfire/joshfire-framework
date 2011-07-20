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



Q.module('Utils / Grid');


Joshfire.define(['joshfire/utils/grid'], function(Grid) {

  Q.test('general grid test', function() {

    var lastEvent = false;

    var g = new Grid({
      'grid': [
        [{
          'id': 'item11'
        }, {
          'id': 'item12'
        }, {
          'id': 'item13'
        }, {
          'id': 'item14'
        }, {
          'id': 'item15'
        }],

        [null,
         {
           'id': 'item22'
         }, {
           'id': 'item23'
         }]

      ],
      'dimensions': 2,
      'onChange': function(coords, elem) {
        lastEvent = ['onChange', coords, elem];
      },
      'onExit': function(side, abSide) {
        lastEvent = ['onExit', side, abSide];
      },
      'orientation': 'up'
    });

    g.goTo([0, 0]);
    Q.same(lastEvent, ['onChange', [0, 0],
          {
            'id': 'item11'
          }], 'Init');

    g.go('right');
    Q.same(lastEvent, ['onChange', [1, 0],
          {
            'id': 'item12'
          }], 'right');

    g.go('right');
    Q.same(lastEvent, ['onChange', [2, 0],
          {
            'id': 'item13'
          }], 'right');

    g.go('down');
    Q.same(lastEvent, ['onChange', [2, 1],
          {
            'id': 'item23'
          }], 'down');

    g.go('left');
    Q.same(lastEvent, ['onChange', [1, 1],
          {
            'id': 'item22'
          }], 'left');

    g.go('up');
    Q.same(lastEvent, ['onChange', [1, 0],
          {
            'id': 'item12'
          }], 'up');

    /*
    manage redirections in the future
    
    g.go("left");
    Q.same(lastEvent,["onChange",{"id":"item11"}],'left');
    
    g.go("down");
    Q.same(lastEvent,["onChange",{"id":"item22"}],'down');
    
    g.go("down");
    Q.same(lastEvent,["onExit",{"id":"item22"},"down"],'down');
    */

    g.go('up');
    Q.same(lastEvent, ['onExit', 'up', 'down'], 'up');

    g.go('left');
    Q.same(lastEvent, ['onChange', [0, 0],
          {
            'id': 'item11'
          }], 'left');

    g.go('left');
    Q.same(lastEvent, ['onExit', 'left', 'left'], 'left');

    g.goTo([4, 0]);
    Q.same(lastEvent, ['onChange', [4, 0],
          {
            'id': 'item15'
          }], 'goTo');

    g.go('right');
    Q.same(lastEvent, ['onExit', 'right', 'right'], 'left');
  });


  // ----------------------------------------------------------------------------


  Q.test('sticky grid test', function() {

    var lastEvent = false;

    var g = new Grid({
      'grid': [
        [{
          'id': 'item11'
        }, {
          'id': 'item12'
        }, {
          'id': 'item13'
        }, {
          'id': 'item14'
        }, {
          'id': 'item15'
        }],

        [null,
         {
           'id': 'item22'
         }, {
           'id': 'item23'
         }]

      ],
      'dimensions': 2,
      'sticky': true,
      'onChange': function(coords, elem) {
        lastEvent = ['onChange', coords, elem];
      },
      'onExit': function(side, abSide) {
        lastEvent = ['onExit', side, abSide];
      },
      'orientation': 'up'
    });

    g.goTo([0, 0]);
    Q.same(lastEvent, ['onChange', [0, 0],
          {
            'id': 'item11'
          }], 'Init');

    g.go('right');
    Q.same(lastEvent, ['onChange', [1, 0],
          {
            'id': 'item12'
          }], 'right');

    g.go('right');
    Q.same(lastEvent, ['onChange', [2, 0],
          {
            'id': 'item13'
          }], 'right');

    g.go('down');
    Q.same(lastEvent, ['onChange', [2, 1],
          {
            'id': 'item23'
          }], 'down');

    g.go('left');
    Q.same(lastEvent, ['onChange', [1, 1],
          {
            'id': 'item22'
          }], 'left');

    g.go('up');
    Q.same(lastEvent, ['onChange', [1, 0],
          {
            'id': 'item12'
          }], 'up');


    g.go('up');
    Q.same(lastEvent, ['onExit', 'up', 'down'], 'up');

    g.go('left');
    Q.same(lastEvent, ['onChange', [0, 0],
          {
            'id': 'item11'
          }], 'left');

    g.go('left');
    Q.same(lastEvent, ['onExit', 'left', 'left'], 'left');


    g.goTo([4, 0]);
    Q.same(lastEvent, ['onChange', [4, 0],
          {
            'id': 'item15'
          }], 'goTo');

    g.go('right');
    Q.same(lastEvent, ['onExit', 'right', 'right'], 'left');

    g.go('down');
    Q.same(lastEvent, ['onChange', [2, 1],
          {
            'id': 'item23'
          }], 'down');

    g.go('right');
    Q.same(lastEvent, ['onChange', [3, 0],
          {
            'id': 'item14'
          }], 'goTo');

    g.go('down');
    Q.same(lastEvent, ['onChange', [2, 1],
          {
            'id': 'item23'
          }], 'down');

    g.go('left');
    Q.same(lastEvent, ['onChange', [1, 1],
          {
            'id': 'item22'
          }], 'left');

    g.go('left');
    Q.same(lastEvent, ['onChange', [0, 0],
          {
            'id': 'item11'
          }], 'releft');

    g.go('down');
    Q.same(lastEvent, ['onChange', [1, 1],
          {
            'id': 'item22'
          }], 'redown');

  });

  Q.start();
});
