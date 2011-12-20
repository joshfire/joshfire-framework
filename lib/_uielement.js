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

Joshfire.define(['joshfire/main', 'joshfire/class', 'joshfire/mixins/pubsub', 'joshfire/mixins/state', 'joshfire/utils/delayedswitch', 'joshfire/vendor/underscore'], function(J, Class, PubSub, State, DelayedSwitch, _) {

  var UIElementBase = Class(

      /**
      * @lends uielement.prototype
      */
      {
        /**
        * Get default options
        * @function
        * @return {Object} hash of options
        * <ul>
        * <li>hideDelay {int}: in seconds, delay before hiding. Defaults 0
        * <li>autoShow {bool}: Defaults true
        * <li>showOnFocus {bool}: Defaults true
        * <li>hideOnBlur {bool}: Defaults false
        * <li>innerTemplate {String}: element's inner template. Use underscorejs syntax. Defaults '&lt;%= htmlInner %&gt;'
        * <li>loadingTemplate {String}: displayed during loading. Defaults 'Loading...'
        * <li>template {String}: element's wrapper template. Defines element's css classes, id, .. Use underscorejs syntax<br />
        *    Default: &lt;div style="display:none;" class="josh-type-&lt;%=type%&gt; josh-id-&lt;%=id%&gt; &lt;%=htmlClass%&gt;" id="&lt;%= htmlId %&gt;" data-josh-ui-path="&lt;%= path %>"&gt;&lt;%= htmlOuter %&gt;&lt;/div&gt;
        * <li>autoRefresh {bool}: defaults true
        * <li>autoInsert {bool}: defaults true.
        * </ul>
        */
        getDefaultOptions: function() {
          return {
            hideDelay: 0,
            autoShow: true,
            showOnFocus: true,
            hideOnBlur: false,
            innerTemplate: '<%= htmlInner %>',
            innerHtmlId: false,
            htmlId: false,
            loadingTemplate: 'Loading...',
            template: '<div style="display:none;" class="josh-type-<%= type %> josh-id-<%= id %> <%= htmlClass %>" id="<%= htmlId %>" data-josh-ui-path="<%= path %>"><%= htmlOuter %></div>',
            autoRefresh: true,
            autoInsert: true,
            forceDataPathRefresh: false
          };
        },

        /**
        * @class Base class for UI Elements
        * @constructs
        * @borrows mixins_pubsub#publish as #publish
        * @borrows mixins_pubsub#subscribe as #subscribe
        * @borrows mixins_pubsub#unsubscribe as #unsubscribe
        * @borrows mixins_state#setState as #setState
        * @borrows mixins_state#setStates as #setStates
        * @borrows mixins_state#getState as #getState
        * @borrows mixins_state#onState as #onState
        * @borrows mixins_state#deleteState as #deleteState
        * @param {app} app Reference to the app object.
        * @param {String} id unique identifier.
        * @options {Object} Hash of options
        */
        __constructor: function(app, path, options) {

          var self = this;

          self.app = app;

          self.path = path;

          // /video/player => video_player
          self.id = path.substring(1).replace(/\//g, '_', path);

          self.options = _.extend(self.getDefaultOptions(), options || {});

          self.htmlClass = self.options.htmlClass || '';

          self.htmlId = self.getHtmlId();
          self.innerHtmlId = self.getInnerHtmlId();

          self.htmlEl = false;
          self.innerHtmlEl = false;

          self.parentEl = false;
          self.parentUi = false;

          self.hasFocus = false;

          self.nextShowHide = false;

          self.children = [];

          self.showHideSwitch = new DelayedSwitch(function() {
            self.processShowHide();
          }, null, self.options.hideDelay);

          // Bind event handlers present in the options
          _.each(self.options, function(handler, k) {
            if (k.substring(0, 2) == 'on' && typeof handler == 'function') {
              var evtName = k.charAt(2).toLowerCase() + k.substring(3);
              self.subscribe(evtName, function(ev, data, token) {
                handler(self, ev, data, token);
              });
            }
          });

          //Check freshness automatically on each state event
          self.subscribe('state', function(ev, data) {
            self.checkFresh();
          });

          self.init();

          //Bind to the data
          if (!self.data) {
            self.data = false;
            self.dataPath = false;
          }

          self.publish('afterInit');
        },

        /**
        * @function
        */
        init: function() {},

        /**
        * Performs further init of the element
        * @function
        */
        setup: function(callback) {
          var self = this;

          if (self.options.uiDataMaster) {
            self.app.ui.fetch(self.options.uiDataMaster, false, function() {
              var master = self.app.ui.element(self.options.uiDataMaster);
              master.subscribe('select', function(ev, data) {
                if (!data.length || !data[0].length || !master.dataPath) return;
                var dataPath = master.dataPath + data[0];
                self.setDataPath(dataPath);
              });
            });
          }

          if (self.options.uiDataSync) {
            self.app.ui.fetch(self.options.uiDataSync, false, function() {

              var master = self.app.ui.element(self.options.uiDataSync);
              master.subscribe('data', function(ev, data) {
                if (data.length) {
                  self.setData(data[0]);
                }
              });
            });
          }

          if (typeof self.options.dataPath == 'string') {
            self.setDataPath(self.options.dataPath);
          }

          callback();

        },

        /**
        * Sets the tree root associated with the element
        * @function
        * @param {String} dataPath Tree path.
        */
        setDataPath: function(dataPath) {
          var self = this;
          if (self.dataPath != dataPath || self.options.forceDataPathRefresh) {
            self.setLoading(true);

            self.setState('dataPath', dataPath);

            self.dataPath = dataPath;

            self.app.data.fetch(dataPath, false, function(err, data) {
              //Check that the callback didn't come late
              if (self.dataPath != dataPath) return;
              self.setLoading(false);

              //TODO What to do in this case? fallback to previous dataPath?
              if (err) return;
              self.setData(data);

              if (!self.dataBound) self.bindToDataPath();

            });
          }
        },

        /**
        * @function
        */
        bindToDataPath: function() {
          var self = this;
          self.dataBound = true;

          /* loading events are currently unreliable, fire them from setDataPath() until fixed
          self.app.data.subscribe('loading', function(ev, data) {
          if (self.dataPath == data[0]) {
          self.setLoading(true);
          }
          });
          */

          self.app.data.subscribe('change', function(ev, data) {
            if (self.dataPath == data[0]) {
              self.setData(data[1]);
            }
          });
        },

        /**
        * Puts the element in loading mode
        * @function
        * @param {Boolean} is Loading.
        */
        setLoading: function(isLoading) {

          this.setState('loading', isLoading);
          if (isLoading && this.htmlEl && this.options.loadingTemplate && !this.children.length) {
            this.htmlEl.innerHTML = this.template(this.options.loadingTemplate);
            this.htmlIsLoader = true;
          }
        },


        /**
        * focus
        * @function
        *
        */
        focus: function() {

          var self = this;

          self.publish('beforeFocus', null, true);
          if (!self.hasFocus) {

            if (self.options.showOnFocus === true) {

              //Show all parents
              var pointer = this.path;

              for (var i = 0; i < self.path.split('/').length - 1; i++) {
                self.app.ui.resolveMoves(pointer, 'up', false, function(err, newPath) {
                  self.app.ui.element(newPath).show();
                });
              }
              self.show();
            }

          }

          this.app.ui.setState('focus', this.path);

          this.hasFocus = true;
          this.publish('afterFocus');
        },

        /**
        * blur
        * @function
        */
        blur: function() {
          //console.log("onBlur", this.id, this.options.persistFocus);
          this.publish('beforeBlur', null, true);

          if (this.options.hideOnBlur === true) {
            this.hideDelayed();
          }

          this.hasFocus = false;

          this.publish('afterBlur');
        },


        /**
        * @function
        * @param {Function|String} tpl. If function, _.template(tpl, this) else tpl(this).
        * @return {String}
        */
        template: function(tpl) {
          this._ = _;
          if (_.isFunction(tpl)) {
            return tpl(this);
          } else {
            return _.template(tpl, this);
          }
        },

        /**
        * Do nothing -- this is up to the adapter
        * @function
        */
        show: function() {},

        /**
        * Do nothing -- this is up to the adapter
        * @function
        */
        hide: function() {},

        /**
        * Has CSS class?
        * @function
        */
        hasHtmlClass: function(name) {
          if (!name || typeof name != 'string') return;
          return (' ' + this.htmlEl.className + ' ').indexOf(' ' + name + ' ') != -1;
        },

        /**
        * Add a CSS class
        * @function
        */
        addHtmlClass: function(name) {
          if (!name || typeof name != 'string') return;
          if (!this.hasHtmlClass(name)) {
            this.htmlEl.className += ' ' + name;
          }
        },

        /**
        * Remove a CSS class
        * @function
        */
        removeHtmlClass: function(name) {
          if (!name || typeof name != 'string') return;
          this.htmlEl.className = (' ' + this.htmlEl.className + ' ').split(' ' + name + ' ').join(' ').slice(1, -1);
        },

        /**
        * Toggle a CSS class
        * @function
        */
        toggleHtmlClass: function(name) {
          if (!name || typeof name != 'string') return;
          if (this.hasHtmlClass(name)) {
            this.removeHtmlClass(name);
          } else {
            this.addHtmlClass(name);
          }
        },

        /**
        * @function
        */
        processShowHide: function() {
          if (this.nextShowHide == 'show') {
            this.show();
          } else {
            this.hide();
          }
        },

        /**
        * Show the element, possibly with a delay
        * @function
        */
        showDelayed: function() {
          this.nextShowHide = 'show';
          this.showHideSwitch.reset();
        },

        /**
        * Hide the element, possibly with a delay
        * @function
        */
        hideDelayed: function() {
          this.nextShowHide = 'hide';
          this.showHideSwitch.reset();
        },

        /**
        * Insert into ui parent
        * @function
        */

        insertInParent: function() {
          if (this.parentUi) {
            // Register as a children in the parent
            this.parentUi.children.push(this);
          }
        },

        /**
        * Insert the element in the DOM & call callback
        * @function
        * @param {Object} parentElement
        * @param {Function} callback
        */
        insert: function(parentElement,callback) {
          var self = this;

          if (self.options.autoRefresh) {
            self.subscribe('data', function() {
              self.refresh();
            });
          }

          this.publish('beforeInsert', [parentElement], true);

          this.parentUi = false;
          this.parentInnerHtmlEl = false;

          if (parentElement) {

            //Is it a joshlib element ? (todo better check, instanceof?)
            if (parentElement.app && parentElement.options) {
              this.parentUi = parentElement;
              if (parentElement.innerHtmlEl) {
                this.parentInnerHtmlEl = parentElement.innerHtmlEl;
              }
            } else {
              this.parentInnerHtmlEl = parentElement;
            }

          // No argument was given, try the parent in the tree.ui
          } else if (this.path.length) {
            this.parentUi = this.app.ui.element(this.app.ui.getDirName(this.path));
            this.parentInnerHtmlEl = this.parentUi.innerHtmlEl;
          }
          this.insertInParent();

          this.setState("inserted",true);

          if (this.options.autoShow) {
            this.show();
          }

          this.publish('afterInsert');

          this.insertChildren(false, callback);
        },


        /**
        * Insert element's children
        * @function
        * @param {bool} forceInsert
        * @param {Function} callback
        */
        insertChildren: function(forceInsert, callback) {
          var self = this;

          if (!callback) callback = function() {};

          self.app.ui.fetch(self.path + '/', false, function(err, elts) {
            if (!elts || !elts.length) return callback(err);

            var allCb = _.after(elts.length, function() {
              callback();
            });

            // Insert children elements that have the autoInsert flag
            for (var i = 0; i < elts.length; i++) {
              if (forceInsert || elts[i].element.options.autoInsert) {
                elts[i].element.insert(self, allCb);
              } else {
                allCb();
              }
            }
            return true;
          });

        },

        /**
        * Refresh data in the UIElement
        * @function
        * @param {Function} callback callback when refreshed.
        */
        refresh: function(callback) {
          if (!this.getState("inserted")) return;

          //Reload the innerTemplate if the element was in loading state
          if (this.htmlIsLoader || this.children.length == 0) {

            this.htmlInner = this.getInnerHtml();
            this.htmlEl.innerHTML = this.template(this.options.innerTemplate);
            this.htmlIsLoader = false;
          } else {
            this.innerHtmlEl.innerHTML = this.getInnerHtml();
          }

          this.publish('afterRefresh');

          if (callback) callback();
        },

        /**
        * Gets the actual DOM ElementId of the UIElement
        * @return {String} ElementId.
        */
        getHtmlId: function() {
          if (this.options.htmlId) {
            return this.options.htmlId;
          } else {
            return this.app.id + '__' + this.id.toString().replace(/_/g, '__');
          }
        },

        /**
        * Gets the inner HTML ElementId
        * By default it's the same as the htmlId.
        * @return {String} ElementId.
        */
        getInnerHtmlId: function() {
          if (this.options.innerHtmlId) {
            return this.options.innerHtmlId;
          } else {
            return this.getHtmlId();
          }
        },

        /**
        * Check if element is fresh, and publish state fresh accordingly
        * @function
        **/
        checkFresh: function() {
          //          console.log('checkfresh', this.path, this.isFresh(), this.parentUi ? this.parentUi.path : 'noparent');
          if (this.isFresh()) {
            this.setState('fresh', true);
            this.publish('fresh');
          } else {
            this.setState('fresh', false);
          }

          // Update the freshness of the parent
          if (this.parentUi) {
            this.parentUi.checkFresh();
          }
        },

        /**
        * @function
        * @return {bool}
        */
        isFresh: function() {

          //state=fresh if all children are fresh and it's fresh itself.
          if (!this.getState('loading')) {
            for (var i = 0, l = this.children.length; i < l; i++) {
              //console.log("testing children",i,"of ",this.path,"fresh:");
              if (!this.children[i].isFresh()) {
                //console.log("NO");
                return false;
              }
            }
            return true;
          }
          return false;

        },

        /**
        * Get element's html, processed via this.template()
        * @function
        * @return {String}
        **/
        getHtml: function() {
          this.htmlInner = this.getInnerHtml();
          this.htmlOuter = this.template(this.options.innerTemplate);
          return this.template(this.options.template);
        },

        /**
        * @function
        * @param {Function} callback
        **/
        getFreshHtml: function(callback) {
          var self = this;

          if (this.isFresh()) { //this.getState('fresh')) {
            callback(null, this.getHtml());
          } else {
            var token = this.subscribe('fresh', function(ev,data) {
              self.unsubscribe(token);
              callback(null, self.getHtml());
            });

          }
        },

        /**
        * @function
        * @return {String}
        */
        getInnerHtml: function() {
          return '';
        },

        /**
        * Sets the data for the UIElement
        * @param data Data.
        */
        setData: function(data) {
          this.data = data;
          this.publish('data', [data]);
          this.setLoading(false);
        }

      });

  PubSub.mixin(UIElementBase.prototype);
  State.mixin(UIElementBase.prototype);

  return UIElementBase;
});
