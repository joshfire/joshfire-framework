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

Joshfire.define(['joshfire/uielement', 'joshfire/class', 'joshfire/vendor/underscore'], function(UIElement, Class, _) {
  /**
  * @class
  * @name uielements_input
  * @extends {uielement}
  */
  return Class(UIElement,
    /**
    * @lends uielements_input.prototype
    */
    {
      type: 'Input',

      /**
      * Default options:<br /><ul>
      *   <li>inputType {String}: 'text'</li>
      *   <li>required {Boolean}: false</li>
      *   <li>placeholder {String}: ''</li>
      *   <li>value {String}: ''</li>
      * </ul>
      * @function
      * @return {Object} hash of options.
      */
      getDefaultOptions: function() {
        return _.extend(this.__super(), {
          'inputType': 'text',
          'required': false,
          'placeholder': '',
          'value': ''
        });
      },

      /**
      * Init data and set default selection
      * @function
      */
      init: function() {
        var self = this;
        self.__super();
      },

      /**
      * The html rendering of an input. &lt;input type={this.inputType} required? value={this.value}&gt;
      * @function
      * @return {String} a classic &lt;input type=text|email|url|password /&gt;.
      */
      getHtml: function() {
        return this.template('<input type="' + this.options.inputType + '" class="joshover josh-type-<%=type%> josh-id-<%=id%> <%= cls %>" id="' + this.htmlId + '" ' + (this.options.required ? 'required' :'') + (this.options.placeholder ? ' placeholder="' + this.options.placeholder + '"' :'') + ' value="' + this.options.value + '" />');
      },

      /**
      * Reset value
      * @function
      */
      resetValue: function() {
        this.htmlEl.value = '';
      }
    }
  );
});