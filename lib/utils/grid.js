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

Joshfire.define(['joshfire/class', 'joshfire/vendor/underscore'], function(Class, _) {


  return Class(
      /**
      * @lends utils_grid.prototype
      */
      {

        //Indexed by orientation
        moves: {
          'up': {
            'down': [0, 1],
            'up': [0, -1],
            'right': [1, 0],
            'left': [-1, 0]
          },
          'down': {
            'down': [0, -1],
            'up': [0, 1],
            'right': [1, 0],
            'left': [-1, 0]
          },
          'right': {
            'down': [1, 0],
            'up': [-1, 0],
            'left': [0, 1],
            'right': [0, -1]
          },
          'left': {
            'down': [1, 0],
            'up': [-1, 0],
            'left': [0, -1],
            'right': [0, 1]
          }
        },


        /**
        * @constructs
        * @class A 2D Grid for navigation
        * @param {Object} options Options hash.
        */
        __constructor: function(options) {
          this.options = options;
          this.options.dimensions = options.dimensions || 2;
          this.options.orientation = options.orientation || 'down';
          this.options.direction = options.direction || 'ltr'; //document.dir ?
          this.currentCoords = this.options.defaultPosition || false;
          this.lastCoords = this.options.defaultPosition || false;
          this.id2coords = {};

          if (options.grid) {
            this.setGrid(options.grid);
          }


          if (this.options.inputSource) {
            this.subscribeToInputEvents(this.options.inputSource);
          }
        },

        /**
        * @function
        * @param Object (var).
        */
        setGrid: function(grid) {
          this.grid = grid;
          this.id2coords = {};
          for (var x = 0; x < this.grid.length; x++) {
            for (var y = 0; y < this.grid[x].length; y++) {
              if (this.grid[x][y]) {
                this.id2coords[this.grid[x][y].id] = [y, x];
              }
            }
          }

          if (this.options.onGrid) this.options.onGrid(this.grid);
        },

        getCoordinatesById: function(id) {
          return this.id2coords[id];
        },

        /**
        * @function
        * @param Object (int).
        */
        get: function(coords) {
          return this.grid[coords[1]][coords[0]];
        },

        /**
        * @function
        * @param Object (int).
        */
        goTo: function(coords) {
          if (!this.currentCoords || coords[0] !== this.currentCoords[0] || coords[1] !== this.currentCoords[1]) {
            this.currentCoords = coords;
            this.lastCoords = coords;
            if (this.options.onChange && this.get(this.currentCoords)) this.options.onChange(this.currentCoords, this.get(this.currentCoords));
          }
          if (this.options.onMove) this.options.onMove(this.currentCoords, this.get(this.currentCoords));
        },

        /**
        * @function
        * @param {int}
        */
        goToId: function(id) {
          if (this.id2coords[id]) {
            this.goTo(this.id2coords[id]);
            return true;
          }
          return false;
        },

        /**
        * @function
        * @param {Object}
        */
        go: function(move) {
          if (move == 'default') {
            return this.goTo(this.options.defaultPosition);
          } else if (move == 'last') { //just to re-publish event
            return this.goTo(this.lastCoords);
          }

          var newx = this.moves[this.options.orientation][move][0] + this.currentCoords[0];
          var newy = this.moves[this.options.orientation][move][1] + this.currentCoords[1];
          if ((newy < 0 || newy >= this.grid.length || !this.grid[newy]) || (newx < 0 || newx >= this.grid[newy].length || !this.grid[newy][newx])) {


            // Sticky grid : try to find an item, even if it's not strictly in the same column/line
            if (this.options.sticky) {

              // if x didn't change
              if (this.grid[newy] && this.moves[this.options.orientation][move][0] == 0) {
                //try to find in the same y line
                var closestx = false;

                for (var i = 0; i < this.grid[newy].length; i++) {
                  if (this.grid[newy][i] && (closestx === false || Math.abs(newx - i) < Math.abs(newx - closestx))) {
                    closestx = i;
                  }
                }
                if (closestx !== false) {
                  this.goTo([closestx, newy]);
                  return;
                }
              }

              // if y didn't change
              if (this.moves[this.options.orientation][move][1] == 0) {
                //try to find in the same x line
                var closesty = false;

                for (var j = 0; j < this.grid.length; j++) {
                  if (this.grid[j] && this.grid[j][newx] && (closesty === false || Math.abs(newy - j) < Math.abs(newy - closesty))) {
                    closesty = j;
                  }
                }
                if (closesty !== false) {
                  this.goTo([newx, closesty]);
                  return;
                }
              }

            }

            //absMove is the move that would have been made in the reference "down" orientation
            var oriMove = this.moves[this.options.orientation][move].join('-');
            var absMove = false;
            _.each(this.moves.down, function(elt, k) {
              if (elt.join('-') == oriMove) {
                absMove = k;
              }
            });

            if (this.options.onExit) this.options.onExit(move, absMove); //[ - this.moves[this.options.orientation][move][0], -this.moves[this.options.orientation][move][1]]);
          } else {
            this.goTo([newx, newy]);
          }
        },

        /**
        * @function
        * @param {Object} var
        */
        handleInput: function(data) {
          var cmd = data[0];

          if (this.options.direction == 'rtl' && (this.options.orientation == 'up' || this.options.orientation == 'down')) {
            if (cmd == 'left') {
              cmd = 'right';
            } else if (cmd == 'right') {
              cmd = 'left';
            }
          }
          if (cmd == 'left' || cmd == 'right' || cmd == 'down' || cmd == 'up') {
            this.go(cmd);
          } else if (cmd == 'hover') {
            this.goToId(data[1]);
          } else if (cmd == 'enter') {
            this.goToId(data[1]);
            if (this.options.onValidate) this.options.onValidate(this.currentCoords, this.get(this.currentCoords));
          }

        },

        /**
        * @function
        * @param {Object} obj
        */
        subscribeToInputEvents: function(obj) {
          var self = this;
          obj.subscribe('input', function(ev, data) {
            self.handleInput(data);
          });

        }

      });



});
