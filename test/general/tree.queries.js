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
Joshfire.define(['joshfire/class', 'joshfire/tree'], function(Class,Tree) {

  module('Tree with queries');


  var mytreeClass = Class(Tree, {
    buildTree: function() {
      return [{
        'id': 'leaf1'
      }, {
        'id': 'leaf2',

        //returns a list of integers
        'children': function(query,callback) {
          console.log('skip', query);
          var res = [];
          for (var i = query.skip; i < query.skip + query.limit; i++) {
            res.push({'id': i});
          }
          callback(null, res);
        }
      }, {
        'id': 'leaf3',

        // cache
        'children': function(query,callback) {

          var res = [
            {'id': +new Date()}
          ];

          setTimeout(function() {
            callback(null, res, {
              'cache': 4
            });
          },1100);

        }

      }
      ];
    }
  });




  Q.test('tree queries', function() {

    Q.expect(8);

    //Q.equals(testee2.index,{},'index d\'origine');
    var mytree = new mytreeClass(false, false, {});
    mytree.setup();

    same(mytree.get('/leaf1'), {'id': 'leaf1'});

    same(mytree.get('/leaf2'), {'id': 'leaf2'});

    mytree.fetch('/leaf2/', false, function(err, data) {
      same(data.length, 20);
      same(data[13], {'id': 13});

      mytree.fetch('/leaf2/', {'skip': 10}, function(err, data) {

        same(data.length, 20);
        same(data[13], {'id': 23});

        mytree.resolveMoves('/leaf2', ['down'], {'limit': 3}, function(err, path, data) {

          same(path, '/leaf2/0');

          //TODO, should resolveMoves return data as an array of the new elements that were fetched,
          //or as just the element, like get(path) ?
          same(data.length, 3);
        });

      });

    });




  });


  Q.test('tree caches', function() {

    expect(3);

    var mytree = new mytreeClass(false, false, {});
    mytree.setup();


    stop();

    mytree.fetch('/leaf3/', false, function(err, data1) {

      mytree.fetch('/leaf3/', false, function(err, data2) {

        //cache still fresh
        same(data1, data2);

        //can access synchronously while in cache
        data2get = mytree.get('/leaf3/');

        same(data1, data2get);

        setTimeout(function() {

          //cache expired
          mytree.fetch('/leaf3/', false, function(err, data3) {

            notEqual(data1[0].id, data3[0].id);

            start();

          });

        },5000);

      });
    });




  });


  Q.start();


});
