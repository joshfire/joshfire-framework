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
  * @class Button base class
  * @name uielements_button
  * @augments uielement
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
          return this.template('<input type="button" class="joshover josh-type-<%=type%> josh-id-<%=id%> <%= htmlClass %>"  data-josh-ui-path="' + this.path + '" id="' + this.htmlId + '" value="' + this.options.label + '" />');
        },

        /**
        * Set button label
        * @function
        */
        setLabel: function(label) {
          this.htmlEl.value = label;
        },

        /**
        * Inherits uielement.init()
        * Subscribe to input event, if 'enter', publish select event
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
      }
  );
});
