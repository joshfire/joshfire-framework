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

// ----------------------------------------------------------------------------
// documentation on writing tests here: http://docs.jquery.com/QUnit


var Q = QUnit;
Q.config.autostart = false;

Joshfire.debug = true;
Joshfire.define(['joshfire/class', 'joshfire/tree'], function(Class,Tree) {

  var mytreeClass = Class(Tree, {
    buildTree: function() {
      return [{
        'id': 'leaf1'
      }, {
        'id': 'leaf2',
        'children': [{
          'id': 'leaf21'
        }, {
          'id': 'leaf22',
          'children': [{
            'id': 'leaf221'
          }, {
            'id': 'leaf222'
          }]
        }]
      }, {
        'id': 'leaf3',
        'children': function(query,callback) {
          console.log('TEST getChilden leaf3');
          callback(null, [{
            'id': 'leaf31'
          }, {
            'id': 'leaf32'
          }]);
        }
      }, {
        'id': 'leaf4',
        'label': 'test1'
      }, {
        'id': 'leaf5',
        'children': function(query,callback) {
          setTimeout(function() {
            callback(null, [{
              'id': 'leaf51'
            }, {
              'id': 'leaf52'
            }]);
          }, 500);
        }
      }

      ];
    }
  });


  // ----------------------------------------------------------------------------


  Q.module('Tree tests');


  Q.test('Joshfire installation', function() {

    Q.expect(1);

    Q.equals(typeof Joshfire, 'object', 'Joshfire() declared');

  });


  // ----------------------------------------------------------------------------


  Q.test('tree navigation', function() {

    Q.expect(31);

    //Q.equals(testee2.index,{},'index d\'origine');
    var mytree = new mytreeClass();
    mytree.setup();

    mytree.resolveMoves('/leaf1', 'next', false, function(err, path) {
      Q.equals(path, '/leaf2', 'resolveMove next');
    });

    mytree.resolveMoves('/leaf3', ['next'], false, function(err, path) {
      Q.equals(path, '/leaf4', 'resolveMove next3');
    });

    Q.equals(mytree.get('/leaf4').label, 'test1');

    mytree.resolveMoves('/leaf3', ['next'], false, function(err, path) {
      Q.equals(path, '/leaf4', 'resolveMove next3');
    });

    Q.same(mytree.get('/leaf2').id, 'leaf2');

    Q.same(mytree.get('/leaf2/'), [{
      'id': 'leaf21'
    }, {
      'id': 'leaf22'
    }]);

    //Change a leaf
    mytree.update('/leaf4', {
      'label': 'test2'
    });
    Q.equals(mytree.get('/leaf4').label, 'test2');

    mytree.resolveMoves('/leaf3', ['next'], false, function(err, path) {
      Q.equals(path, '/leaf4', 'resolveMove next3');
    });


    //Change a tree
    mytree.set('/leaf4/', [{
      'id': 'leaf41'
    }, {
      'id': 'leaf42'
    }]);


    Q.same(mytree.get('/leaf4/'), [{
      'id': 'leaf41'
    }, {
      'id': 'leaf42'
    }]);

    var rootm = mytree.get('/');
    Q.same(rootm[0], {
      'id': 'leaf1'
    });

    var laststate = null;
    mytree.subscribe('state', function(ev, data) {
      console.log('state ', data);
      laststate = data;
    });


    laststate = [];

    mytree.moveTo('current', '/leaf4');

    Q.same(laststate, ['current', '/leaf4'], 'tree GoTo current /leaf4');

    mytree.move('current', 'down');

    Q.same(laststate, ['current', '/leaf4/leaf41'], 'tree Go current down+next');

    mytree.move('current', 'next');

    Q.same(laststate, ['current', '/leaf4/leaf42'], 'tree Go current down+next');

    laststate = [];

    mytree.moveTo('focus', '/leaf1');

    Q.same(laststate, ['focus', '/leaf1'], 'tree Goto');

    mytree.move('focus', 'next');

    Q.same(laststate, ['focus', '/leaf2'], 'tree Go focus next');

    mytree.move('focus', 'down');

    Q.same(laststate, ['focus', '/leaf2/leaf21'], 'tree Go focus down');

    mytree.move('focus', 'up');

    Q.same(laststate, ['focus', '/leaf2'], 'tree Go focus up');

    mytree.moveTo('focus', '/leaf2/');

    Q.same(laststate, ['focus', '/leaf2/leaf21'], 'tree Go focus down with last slash');

    mytree.move('focus', 'up');

    Q.same(laststate, ['focus', '/leaf2'], 'tree Go focus up');

    mytree.move('focus', 'up');

    Q.same(laststate, ['focus', '/leaf2'], 'tree Go focus up - the same.');

    mytree.move('focus', 'next');

    Q.same(laststate, ['focus', '/leaf3'], 'tree Go focus next');

    mytree.move('focus', 'down');

    Q.same(laststate, ['focus', '/leaf3/leaf31'], 'tree Go focus down 3');

    mytree.move('focus', 'up');

    Q.same(laststate, ['focus', '/leaf3'], 'tree Go up next ');

    mytree.move('focus', 'next');

    Q.same(laststate, ['focus', '/leaf4'], 'tree Go up next ');

    mytree.move('focus', 'next');

    Q.same(laststate, ['focus', '/leaf5'], 'tree Go up next next');

    //Todo: later.
    //mytree.move("focus","down");
    //should not be loaded right away
    Q.same(laststate, ['focus', '/leaf5'], 'Async!');

    Q.same(mytree.get('/leaf5').id, 'leaf5');

    mytree.move('focus', 'down');

    //Q.same(mytree.get("/leaf5/"),"loading");
    Q.stop();

    setTimeout(function() {

      Q.same(mytree.get('/leaf5').id, 'leaf5');

      Q.same(((mytree.get('/leaf5/') || [{
        'id': 'noleaf5'
      }])[0] || {
        'id': 'noidinzero'
      }).id, 'leaf51');

      Q.same(laststate, ['focus', '/leaf5/leaf51'], 'Down Async');

      mytree.move('focus', ['up', 'prev', 'prev', 'prev', 'down', 'next', 'down', 'next', 'prev', 'next']);
      Q.same(laststate, ['focus', '/leaf2/leaf22/leaf222'], 'Big path');


      Q.start();
    }, 700);


  });

  // ----------------------------------------------------------------------------



  Q.test('tree fetch', function() {

    Q.expect(5);

    //Q.equals(testee2.index,{},'index d\'origine');
    var mytree = new mytreeClass();
    mytree.setup();




    mytree.fetch('/leaf3', false, function(err, data) {
      Q.same(data, {'id': 'leaf3'});
    });

    //with CB
    mytree.fetch('/leaf3/', false, function(err, data) {
      Q.same(data, [{'id': 'leaf31'},{'id': 'leaf32'}]);
    });

    //with static children
    mytree.fetch('/leaf2/', false, function(err,data) {
      Q.same(data, [{'id': 'leaf21'}, {'id': 'leaf22'}]);
    });

    mytree.fetch('/leaf3/leaf31', false, function(err, data) {
      Q.same(data, {'id': 'leaf31'});
    });

    mytree.fetch('/leaf3/leaf31/', false, function(err, data) {
      Q.same(data, []);
    });


  });




  // ----------------------------------------------------------------------------


  Q.test('tree incremental additions', function() {

    Q.expect(6);


    var mytree = new mytreeClass();
    mytree.setup();


    var lastTreeData = null;
    mytree.subscribe('change', function(ev, data) {
      if (data[0] == '/') {
        console.log('***treeData ', data);
        lastTreeData = data[1];
      }
    });

    mytree.set('/', [{
      'id': 'leafbefore'
    }]);

    Q.stop();

    setTimeout(function() {


      Q.same(lastTreeData[0].id, 'leafbefore', 'Load');

      mytree.moveTo('focus', '/leafbefore');

      mytree.insert('/', {skip: 1}, [{
        'id': 'leaf1'
      }]);

      setTimeout(function() {

        Q.same(lastTreeData[0].id, 'leafbefore', 'leafbefore');
        Q.same(lastTreeData[1].id, 'leaf1', 'leaf1');

        mytree.insert('/', {skip: 2}, [{
          'id': 'leafafter'
        }]);

        mytree.insert('/', {skip: 0}, [{
          'id': 'leafbeforereplaced'
        }]);


        setTimeout(function() {

          Q.same(lastTreeData[0].id, 'leafbeforereplaced', 'leafbeforereplaced');
          Q.same(lastTreeData[1].id, 'leaf1', 'leaf1');
          Q.same(lastTreeData[2].id, 'leafafter', 'leafafter');


          Q.start();

        }, 100);

      }, 100);

    }, 100);

  });


  // ----------------------------------------------------------------------------


  Q.test('async tree navigation', function() {

    var doCb;

    var myapp;

    var laststate = null;


    var rst = function() {

      var mytree = new mytreeClass();
      mytree.setup();

      mytree.set('/leaf2', {
                  'id': 'leaf2',
                  'children': function(query,callback) {

          doCb = function() {
            callback(null, [{
                              'id': 'leaf21'
            }, {
                              'id': 'leaf22'
            }]);
          };

        }
      });
      //console.log(mytree);

      mytree.subscribe('state', function(ev, data) {
                  console.log('state ', data);
                  laststate = data;
      });

      return mytree;
    };


    var mytree = rst();


    mytree.moveTo('focus', '/');

    Q.same(laststate, ['focus', '/leaf1'], 'tree init - first child');


    mytree.moveTo('focus', '/leaf1');

    Q.same(laststate, ['focus', '/leaf1'], 'tree init');

    mytree.move('focus', 'down');

    Q.same(laststate, ['focus', '/leaf1'], 'Still');

    mytree.move('focus', 'next');

    Q.same(laststate, ['focus', '/leaf2'], 'Next');

    mytree.move('focus', 'down');

    Q.same(laststate, ['focus', '/leaf2/'], 'Down');

    doCb();

    Q.same(laststate, ['focus', '/leaf2/leaf21'], 'Loaded');


    mytree = rst();

    mytree.moveTo('focus', '/leaf1');
    Q.same(laststate, ['focus', '/leaf1'], 'tree init');

    mytree.move('focus', 'next');
    Q.same(laststate, ['focus', '/leaf2'], 'Next');

    mytree.move('focus', 'down');
    Q.same(laststate, ['focus', '/leaf2/'], 'Down');

    mytree.move('focus', 'up');
    Q.same(laststate, ['focus', '/leaf2'], 'Reup before CB');

    doCb();

    Q.same(laststate, ['focus', '/leaf2'], 'No change');

  });


  // ----------------------------------------------------------------------------


  Q.test('preload all', function() {

    Q.expect(6);


    var mytree = new mytreeClass();
    mytree.setup();

    mytree.prefetchAll();


    mytree.set('/', [{
      'id': 'leaf1'
    }, {
      'id': 'leaf2',
      'children': [{
        'id': 'leaf21'
      }, {
        'id': 'leaf22'
      }]
    }, {
      'id': 'leaf3',
      'children': function(query,callback) {
        setTimeout(function() {
          callback(null, [{
            'id': 'leaf31',
            'children': function(query,callback) {
              setTimeout(function() {
                callback(null, [{
                                  'id': 'leaf311'
                }, {
                                  'id': 'leaf312'
                }]);
              }, 500);
            }
          }, {
            'id': 'leaf32'
          }]);
        }, 500);
      }
    }, {
      'id': 'leaf4',
      'label': 'test1'
    }, {
      'id': 'leaf5',
      'children': function(query,callback) {
        setTimeout(function() {
          callback(null, [{
            'id': 'leaf51',
            'children': function(query,callback) {
              setTimeout(function() {
                callback(null, [{
                                  'id': 'leaf511'
                }, {
                                  'id': 'leaf512'
                }]);
              }, 500);
            }
          }, {
            'id': 'leaf52',
            'children': function(query,callback) {
              setTimeout(function() {
                callback(null, [{
                                  'id': 'leaf521'
                }, {
                                  'id': 'leaf522'
                }]);
              }, 500);
            }
          }]);
        }, 500);
      }
    }

    ]);


    Q.equals(mytree.get('/leaf4').label, 'test1');


    Q.stop();

    // TODO: doesn't yet use a single datasource with directory-level ordering
    // when it does, uncomment the "is undefined" assertions
    setTimeout(function() {

      Q.same(mytree.get('/leaf3/leaf31').id, 'leaf31');
      //Q.same(mytree.get('/leaf5/leaf51'), undefined);

      setTimeout(function() {

        Q.same(mytree.get('/leaf5/leaf51').id, 'leaf51');
        //Q.same(mytree.get('/leaf3/leaf31/leaf312'), undefined);

        setTimeout(function() {

          Q.same(mytree.get('/leaf3/leaf31/leaf312').id, 'leaf312');
          //Q.same(mytree.get('/leaf5/leaf51/leaf511'), undefined);

          setTimeout(function() {

            Q.same(mytree.get('/leaf5/leaf51/leaf511').id, 'leaf511');
            //Q.same(mytree.get('/leaf5/leaf52/leaf522'), undefined);

            setTimeout(function() {

              Q.same(mytree.get('/leaf5/leaf52/leaf522').id, 'leaf522');

              Q.start();

            }, 500);

          }, 500);

        }, 500);

      }, 500);


    }, 750);


  });



  //TODO test sets on root element



  Q.start();

});

