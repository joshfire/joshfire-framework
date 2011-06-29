/*!
 * Joshfire Framework 0.9.0
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jun 29 16:25:37 2011
 */


Joshfire.define(['joshfire/uielement', 'joshfire/class'], function(UIElement, Class) {
  /**
  * @class
  * @name uielements_button
  * @extends {uielement}
  */
  return Class(UIElement,
      /**
      * @lends uielements_button.prototype
      */
      {
        type: 'Button',

        /**
        * The html rendering of a Button. &lt;input type=button value={this.label} /&gt;
        * @function
        * @return {String} a classic &lt;input type=button /&gt;.
        */
        getHtml: function() {
          return '<input type="button" class="joshover" data-josh-ui-path="' + this.path + '" id="' + this.htmlId + '" value="' + this.options.label + '" />';
        },
        /**
        * Inherits uielement.init()
        * Subscibe to input event, if 'enter', publish select event
        * @function
        */
        init: function() {
          var self = this;
          self.__super();
          self.subscribe('input', function(ev, data) {
            if (!data || data.length == 0) {
              return;
            }
            switch (data[0]) {
              case 'enter':
                self.publish('select', [self.id]);
            }
          });
        }
      });
});
