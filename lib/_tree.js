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

Joshfire.define(['joshfire/main', 'joshfire/class', 'joshfire/mixins/pubsub', 'joshfire/mixins/state', 'joshfire/vendor/underscore', 'joshfire/vendor/json2'], function(J, Class, PubSub, State, _, JSON) {


  var Tree = Class(
      /**
      * @lends tree.prototype
      */
      {
        allowRootAccess: false,

        inverses: {
          'down': 'up',
          'up': 'down',
          'next': 'prev',
          'prev': 'next'
        },

        /**
        * @constructs
        * @borrows mixins_pubsub#publish as #publish
        * @borrows mixins_pubsub#subscribe as #subscribe
        * @borrows mixins_pubsub#unsubscribe as #unsubscribe
        * @borrows mixins_state#setState as #setState
        * @borrows mixins_state#setStates as #setStates
        * @borrows mixins_state#getState as #getState
        * @borrows mixins_state#onState as #onState
        * @borrows mixins_state#deleteState as #deleteState
        * @class Tree structure base class
        * @param {app} app Reference to the app object.
        * @param {string} id ID for the tree.
        * @param {Object} options Options object.
        */
        __constructor: function(app, id, options) {

          this.app = app;

          this.options = _.extend({
            'defaultQuery': {
              'limit': 20,
              'skip': 0
            }
          },options || {});

          this.id = id;

          this.id2index = {};

          this.beingLoaded = {};

          this.stateChangeSerial = 1;

          this.tree = {};

          this.childrenFunctions = {};

          this.queryCache = {};

          this.itemCache = {};

          this.init();

        },

        init: function() {

        },

        /**
        * Performs setup
        * @methodOf tree.prototype
        * @param {Function} callback when finished.
        */
        setup: function(callback) {
          if (this.options.tree) {
            this.set('/', this.options.tree, callback);
          } else {
            this.set('/', this.buildTree ? this.buildTree() : [], callback);
          }
        },

        /**
        * Moves a register to a path
        * @methodOf tree.prototype
        * @param {string} register Name of the register.
        * @param {string} path Path to store in the register.
        * @param {Object} query Query for the last "down" move if needed.
        */
        //absolute
        moveTo: function(register, path, query) {
          var self = this;
          if (!path) return;
          //Go to first child
          if (self.isDirectory(path)) {
	        var async = true;
            self.resolveMoves(path.substring(0, path.length - 1), ['down'], query, function(err, newPath) {
	          //console.log("FChild callback got "+newPath,newPath);
              async = false;
              self.setState(register, newPath);
            });
		  //Set the temporary register
            if (async) {
              //console.log("FChild callback was async, setting "+path,path);
              self.setState(register, path);
            }
          } else {
            self.setState(register, path);
          }
          return;
        },

        /**
        * Apply of list of moves to a path in a register
        * @methodOf tree.prototype
        * @param {string} register Name of the register.
        * @param {Array} moves List of moves to perform.
        * @param {Object} query Query for the last "down" move if needed.
        */
        move: function(register, moves, query) {
          var self = this;

          var localSerial = ++self.stateChangeSerial;


          if (!moves) return;

          var async = true;
          self.resolveMoves(self.getState(register), moves, query, function(err, newPath) {
            async = false;

            //Don't send an event if in the meantime the state changed.
            if (localSerial == self.stateChangeSerial) {
              self.moveTo(register, newPath);
            }
          });

          // While we're loading children of /directory, set us in the temporary
          // /directory/ state (with final slash)
          if (async && (moves == 'down' || (moves.length == 1 && moves[0] == 'down'))) {
            self.setState(register, (self.getState(register) + '/').replace(/\/\/$/, '/'));
          }

        },

        /**
        * Removes useless move sequences like ['up','down']
        * @methodOf tree.prototype
        * @param {Array} moves An array of moves.
        * @return {Array} Array A possibly smaller array of moves.
        */
        compactMoves: function(moves) {
          if (moves.length < 2) return [].concat(moves);
          var newMoves = [];

          for (var i = 0; i < moves.length; i++) {
            if ((i < moves.length - 1) && moves[i] == this.inverses[moves[i + 1]]) {
              i++;
            } else {
              newMoves.push(moves[i]);
            }
          }

          return newMoves;

        },



        /**
        * Apply a move sequence to a path and get the result path
        * @methodOf tree.prototype
        * @param {String} path The starting path.
        * @param {Array} moves An array of moves.
        * @param {Object} query A query object for the last "down" move if any.
        * @param {Function} callback A callback for the end path.
        */
        resolveMoves: function(path, moves, query, callback) {
          var self = this;

          // Accept moves as a string if there is only one
          if (_.isString(moves)) {
            moves = [moves];
          } else {
            moves = [].concat(moves);
          }

          //Can't resolve moves from a directory. Start from its first child.
          if (this.isDirectory(path)) {
            path = this.getDirName(path);
            moves.unshift('down');
          }
          moves = [].concat(this.compactMoves(moves));

          //console.warn("resolveMoves",path,moves,query);

          var next = function(err, newPath, newData) {
            if (err) return callback(err);
            //console.log("cb",JSON.stringify(moves),newPath,newData);
            //No more moves: we have reached destination, launch main callback
            if (moves.length === 0) {

              return callback(null, newPath, newData);
            }
            var move = moves.shift();

            if (move == 'up') {
              self._resolveMoveUp(newPath, next);
            } else if (move == 'next') {
              self._resolveMoveNextPrev(newPath, 1, next);
            } else if (move == 'prev') {
              self._resolveMoveNextPrev(newPath, -1, next);
            } else if (move == 'down') {
              var isLastDown = (_.indexOf(moves, 'down') == -1);
              self._resolveMoveDown(newPath, isLastDown ? query : false, next);
            }

          };

          next(null, path);

        },


        /**
        * Move next (direction=1) or prev (direction=-1)
        */
        _resolveMoveNextPrev: function(path, direction, callback) {
          var dir = this.getDirName(path) + '/';
          var basename = this.getBaseName(path);
          var i = this.id2index[dir][basename];

          i += direction;

          if (i >= 0 && i < this.tree[dir].length) {
            path = dir + this.tree[dir][i].id;
          }
          callback(null, path);
        },


        /**
        * Move up
        */
        _resolveMoveUp: function(path, callback) {
          var dir = this.getDirName(path);
          //Not yet at root level?
          if (dir !== '' || this.allowRootAccess) {
            path = dir;
          }
          callback(null, path);
        },


        /**
        * Move down
        */
        _resolveMoveDown: function(path, query, callback) {
          var self = this;


          // There is a registered children() function, will be called to get the children.
          if (self.childrenFunctions[path]) {

            query = self._prepareQuery(query);

            var gotChildren = function(error,children,options,fromCache) {
              if (error) return callback(error);
              //console.log('got children CB', fromCache, path, children, options);
              if (!fromCache) {
                self.addToQueryCache(path, query, children, options);
                for (var i = 0, l = children.length; i < l; i++) {
                  self.addToItemCache(path + '/' + children[i].id, children[i], options);
                }
                self.insert(path + '/', query, children, options);
              }
              if (!children.length){
                callback(null, path, []);
              }
              else{
                path = path + '/' + self.tree[path + '/'][0].id;
                callback(null, path, children);  
              }
              
            };

            var cached = self.checkQueryCache(path, query);
            if (cached) {
              //console.log('got cached', cached);
              gotChildren(null, cached.data, cached.options, true);
              return;
            }

            var loadingKey = path + '/ ' + JSON.stringify(query);

            //If it's already marked as being loaded, add ourselves to the callback queue
            if (self.beingLoaded[loadingKey]) {
              //console.log('being loaded', self.beingLoaded);
              self.beingLoaded[loadingKey].push(gotChildren);
              return;
            }

            self.beingLoaded[loadingKey] = [gotChildren];
            self.publish('loading', [path + '/', query], true);

            self.childrenFunctions[path](query, function(error, children, options) {
              var callbacks = self.beingLoaded[loadingKey];
              delete self.beingLoaded[loadingKey];

              _.each(callbacks, function(cb) {
                cb(error, children, options || {});
              });

            });


          //If we already have registered children
          } else if (self.tree[path + '/']) {

            if (self.tree[path + '/'] == 'loading') {
            //TODO fire when ready?
            } else {

              //Go to the first child
              if (self.tree[path + '/'].length > 0) {
                path = path + '/' + self.tree[path + '/'][0].id;
              }
              var dir = this.getDirName(path) + '/';

              callback(null, path, this.get(dir));

            }

          //Nothing down
          } else {

            callback(null, path, []);
          }
        },

        _prepareQuery: function(query) {
          query = _.extend({},this.options.defaultQuery, query || {});
          return query;
        },


        checkQueryCache: function(path, query) {
          var jsonQuery = JSON.stringify(query);
          if (this.queryCache[path] && this.queryCache[path][jsonQuery]) {

            if (+new Date() < this.queryCache[path][jsonQuery].expires) {
              return this.queryCache[path][jsonQuery];
            } else {
              delete this.queryCache[path][jsonQuery];
            }
          }
          return null;
        },

        addToQueryCache: function(path, query, data, options) {

          var cache = options.cache; //TODO default
          if (!cache) return;

          var jsonQuery = JSON.stringify(query);
          if (!this.queryCache[path]) this.queryCache[path] = {};
          this.queryCache[path][jsonQuery] = {
            expires: +new Date() + (cache * 1000),
            data: data,
            options: options
          };
        },

        checkItemCache: function(path) {
          if (this.itemCache[path]) {
            if (+new Date() < this.itemCache[path].expires) {
              return this.itemCache[path].data;
            } else {
              delete this.itemCache[path];
            }
          }
          return null;
        },

        addToItemCache: function(path, data, options) {

          var cache = options.cache; //TODO default
          if (!cache) return;

          this.itemCache[path] = {
            expires: +new Date() + (cache * 1000),
            data: data,
            options: options
          };
        },



        /**
        * Gets the data at some path in the tree, synchronously
        * @methodOf tree.prototype
        * @param {String} path The path.
        * @return Tree data.
        */
        get: function(path) {
          //Directory
          if (this.isDirectory(path)) {

            //if (this.beingLoaded[path]) {
            //    return "loading";
            return this.tree[path];

          //Leaf
          } else {

            var dir;
            if (path === '') {
              dir = '';
            } else {
              dir = this.getDirName(path) + '/';
            }

            var basename = this.getBaseName(path);

            //if (this.beingLoaded[dir]) {
            //    return "loading";
            if (this.tree[dir] && this.id2index[dir] !== null) {
              var i = this.id2index[dir][basename];
              if (i !== null) {
                return this.tree[dir][i];
              }
            }
            return null;

          }

        },




        /**
        * Gets the data at some path in the tree, asynchronously (Unfolds the tree if needed)
        * @methodOf tree.prototype
        * @param {string} path
        * @param {Object} query A query object for the last "down" move if any.
        * @param {Function} callback when finished.
        */
        fetch: function(path, query, callback) {
          var self = this;

          //console.warn('fetch', path, query);

          if (path == '/') {
            return callback(null, self.get('/'));
          }

          var isDirectory = self.isDirectory(path);

          var parts = path.substring(1).split('/');

          var current = '';

          if (!isDirectory) {
            var itemCached = this.checkItemCache(path);
            if (itemCached) {
              return callback(null, itemCached);
            }
          }

          var next = function() {

            //console.log('next tree', current, path, JSON.stringify(parts), parts.length);

            //Use the query parameter in the last down move
            self.resolveMoves(current, ['down'], (parts.length == 1) ? query : false, function(err, newPath, newData) {
              //console.log('got cb', newPath);
              if (parts.length == 1) {
                if (isDirectory) {
                  callback(null, newData);
                } else {
                  callback(null, self.get(path));
                }

              } else {
                current += '/' + parts.shift();
                next();
              }
            });

          };



          next();


        },



        /**
        * Tests if a path is a directory
        * @methodOf tree.prototype
        * @param {String} path The path.
        * @return {Boolean} Wheter the path is a directory.
        */
        isDirectory: function(path) {
          return path.charAt(path.length - 1) == '/';
        },

        /**
        * Returns the final component of a pathname
        * @methodOf tree.prototype
        * @param {String} path The path.
        * @return {String} Final component.
        */
        getBaseName: function(path) {
          var tmp = path.split('/');
          return tmp[tmp.length - 1];
        },


        sendChangeEvent: function(path) {
          this.publish('change', [path, this.get(path)]);
        },


        /**
        * Returns the directory component of a pathname
        * @methodOf tree.prototype
        * @param {String} path The path.
        * @return {String} Directory name.
        */
        getDirName: function(path) {
          return path.replace(/\/[^\/]*$/, '');
        },



        /**
        * Update just one bit of data. Not compatible with too much format() !
        * @methodOf tree.prototype
        * @param {String} path The path.
        * @param data The tree data.
        */
        update: function(path, data) {

          var tree = this.get(path);

          _.extend(tree, data);

          this.set(path, tree);

        },


        /**
        * Assigns data to a path in the tree
        * @methodOf tree.prototype
        * @param {String} path The path.
        * @param data The tree data.
        * @param {Function} callback Callback when done (some formatters may be asynchronous).
        */
        set: function(path, treeData, callback) {

          var data = _.clone(treeData);

          callback = callback || function() {};

          //console.log('set', path, data);
          var self = this;

          //When set() on a directory, do set()s on all its children
          if (self.isDirectory(path)) {

            self.tree[path] = [];
            self.id2index[path] = {};

            if (!data.length) {
              return callback();
            }

            var cb = _.after(data.length, function() {
              self.sendChangeEvent(path);
              callback();
            });

            for (var y = 0; y < data.length; y++) {
              self.id2index[path][data[y].id] = y;
              self.set(path + data[y].id, data[y], cb);
            }

          } else {

            var dir;

            //Special case for root element that has no directory.
            if (path === '') {
              dir = '';
              self.id2index[''] = {
                '': 0
              };
              self.tree[''] = [];
            } else {
              dir = self.getDirName(path) + '/';
            }

            var basename = self.getBaseName(path);

            // We have no base point to attach to...
            if (self.tree[dir] === null || self.id2index[dir] === null) {
              return callback('no base point');
            }

            var i = self.id2index[dir][basename];

            if (i === null) {
              return callback('no base point');
            }

            //Delete all the data below that point
            //TODO also other references ? (beingLoaded, childrenfunction, ..)
            _.each(self.tree, function(elt, key) {
              if (key.indexOf(path + '/') === 0) {
                delete self.tree[key];
              }
            });


            var children = data.children;
            delete data.children;

            var saveItem = function() {

              self.formatItem(path, data, function(error, newData) {
                self.tree[dir][i] = newData;

                self.sendChangeEvent(path);

                callback();
              });
            };

            if (_.isFunction(children)) {
              self.childrenFunctions[path] = children;

            } else if (_.isArray(children)) {
              self.set(path + '/', children, function(err) {
                if (err) return callback(err);
                saveItem();
              });
              return;
            }
            saveItem();

          }

        },


        /**
        * Insert data to a path in the tree
        * @methodOf tree.prototype
        * @param {String} path The path.
        * @param {Object} query Query used to position the data (uses query.skip mostly).
        * @param data The tree data.
        * @param {Object} options Options returned by the children() callback.
        */
        insert: function(path, query, data, options) {
          if (this.isDirectory(path)) {

            // very unoptimized implementation for now

            var oldData = this.get(path) || [];
            //console.warn("insert",path,query,data,"gets",oldData.slice(0, query.skip),data,oldData.slice(query.skip+data.length, oldData.length));
            this.set(path, oldData.slice(0, query.skip).concat(data, oldData.slice(query.skip + data.length, oldData.length)));

          } else {
            //TODO error
          }

        },

        /**
        * Formats an item of the tree before insertion
        * @methodOf tree.prototype
        * @param {String} path The path being formatter.
        * @param data The tree data to format.
        */
        formatItem: function(path, data, callback) {
          callback(null, data);
        },

        /**
        * Preloads all tree data
        * @methodOf tree.prototype
        */
        prefetchAll: function() {
          var self = this;
          self.subscribe('change', function(ev, data) {
            //console.log('data', data, self.childrenFunctions);
            var path = data[0];
            if (!self.isDirectory(path) && (self.childrenFunctions[path])) {

              self.moveTo('preload', path + '/');

            }


          });
        }


      });


  PubSub.mixin(Tree.prototype);
  State.mixin(Tree.prototype);

  return Tree;

});
