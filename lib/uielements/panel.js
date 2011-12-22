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

Joshfire.define(['joshfire/uielement', 'joshfire/class'], function(UIElement, Class) {
  /**
  * @class Panel base class
  * @name uielements_panel
  * @augments uielement
  */
  return Class(UIElement,
      /**
      * @lends uielements_panel.prototype
      */
      {
        type: 'Panel',

        /**
          * Get panel inner html. this.options.content || this.data.content
          * @function
          *
          */
          getInnerHtml: function() {
            console.log(this.id, 'get inner html')
            if (this.options.itemTemplate){
              var tplFunc = (_.isFunction(this.options.itemTemplate)) ?  this.options.itemTemplate : _.template(this.options.itemTemplate);
              this.item = this.data || {};
              return content =tplFunc(this);
            } 
            if (this.options.content) {
              return this.options.content;
            } else {
              if (this.data && this.data.content) {
                return this.data.content;
              } else {
                return this.__super();
              }
            }
          },

        refresh: function(callback) {
          // Don't refresh if we have children
          if (!this.children.length) {
            return this.__super(callback);
          }
        }
      }
  );
});