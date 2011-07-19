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
  * @name uielements_text
  * @extends {uielement}
  */
  return Class(UIElement,
    /**
    * @lends uielements_text.prototype
    */
    {
      type: 'Text',

      /**
      * The html rendering of a text widget. &lt;p&gt;{this.text}&lt;/&gt;
      * @function
      * @return {String} a classic paragraph.
      */
      getHtml: function() {
        return this.template('<p class="josh-type-<%= type %> <%= cls %>"  data-josh-ui-path="' + this.path + '" id="' + this.htmlId + '">' + this.options.text + '</p>');
      }
    }
  );
});