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

Joshfire.define(['joshfire/uielements/panel', 'joshfire/class', 'joshfire/vendor/underscore'], function(Panel, Class, _) {
  /**
  * @class Page base class
  * @name uielements_page
  * @augments uielements_panel
  */
  return Class(Panel,
      /**
      * @lends uielements_page.prototype
      */
      {
        /*
        * Initialize view
        * @function
        */
        init: function() {
          var self = this;
          self.viewHtml = false;
        },

        /**
        * @function
        * @param {Function} callback callback when rendered.
        */
        getFreshHtml: function(callback) {
          var self = this;

          self.setLoading(true);

          var params = {
            'query': self.getState('query'),
            'params': self.getState('params'),
            'body': self.getState('body'),
            'headers': self.getState('headers')
          };

          self.render(params, function(err, html) {
            self.viewHtml = html;
            callback(err, html);
          });
        },

        /**
        * @ignore
        **/
        redirect: function(destination,code) {

        },

        /**
        * Returns html id of the current sequence
        * @function
        * @return {string}
        */
        getHtmlId: function() {
          return this.__super() + '_page' + (this.options.sequenceId || '0');
        },

        /**
        * @function
        * @return {string} inner html.
        */
        getInnerHtml: function() {
          if (this.viewHtml === false) {
            return this.__super();
          } else {
            return this.viewHtml;
          }
        },

        /**
        * @ignore
        **/
        insertChildren: function() {}
      }
  );
});
