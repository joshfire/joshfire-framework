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

Joshfire.define(['joshfire/uielement', 'joshfire/class', 'joshfire/vendor/underscore'], function(UIElement, Class, _) {
  /**
  * @class Form input base class
  * @name uielements_input
  * @augments uielement
  */
  return Class(UIElement,
      /**
      * @lends uielements_input.prototype
      */
      {
        type: 'FormInput',

        /**
        * Default options:<br /><ul>
        *   <li>label {String}: ''</li>
        *   <li>inputType {String}: 'text'</li>
        *   <li>required {Boolean}: false</li>
        *   <li>placeholder {String}: ''</li>
        *   <li>autofocus {Boolean}: false</li>
        *   <li>value {String}: ''</li>
        * </ul>
        * @function
        * @return {Object} hash of options.
        */
        getDefaultOptions: function() {
          return _.extend(this.__super(), {
            'label': '',
            'inputType': 'text',
            'required': false,
            'placeholder': '',
            'autofocus': false,
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

          /* self.subscribe('input', function(ev, data){
          if (data[0]=='enter'){
          //            self.focus();
          self.app.ui.setState('focus', self.path);
          }
          });*/

          self.subscribe('afterInsert', function() {
            $('#' + self.htmlId + '_input').bind('focus', function() {
              self.app.ui.setState('focus', self.path);
            });
          });
        },

        /**
        * The html rendering of an input and its label. &lt;input type={this.inputType} required? value={this.value}&gt;
        * @function
        * @return {String} a classic &lt;input type=text|email|url|password /&gt;.
        */
        getInnerHtml: function() {
          var label = '<label for="' + this.htmlId + '_input">' + this.options.label + '</label>';
          var input;
          
          if (this.options.inputType == 'textarea') {
            input = '<textarea ' +
                    'class="joshover josh-type-<%=type%> josh-id-<%=id%> <%= htmlClass %>" ' +
                    'id="' + this.htmlId + '_input" ' +
                    (this.options.required ? 'required ' : ' ') +
                    (this.options.autofocus ? 'autofocus ' : ' ') +
                    (this.options.placeholder ? 'placeholder="' + this.options.placeholder + '" ' : ' ') + ' >' +
                    this.options.value +
                    '</textarea>';
          } else {
            input = '<input type="' + this.options.inputType + '" ' +
                    'class="joshover josh-type-<%=type%> josh-id-<%=id%> <%= htmlClass %>" ' +
                    'id="' + this.htmlId + '_input" ' +
                    (this.options.required ? 'required ' : ' ') +
                    (this.options.autofocus ? 'autofocus ' : ' ') +
                    (this.options.placeholder ? 'placeholder="' + this.options.placeholder + '" ' : ' ') +
                    'value="' + this.options.value + '" ' +
                    '/>';
          }
          return this.template(label + input);
        },

        /**
        * Get the input's value
        * Beware, it's trimmed
        * @function
        * @return {String}
        */
        getValue: function() {
          // children[0] = label
          // children[1] = input
          return (this.htmlEl.children[1].value).replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, '');
        },

        /**
        * Set the input's value
        * @function
        */
        setValue: function(value) {
          // children[0] = label
          // children[1] = input
          this.htmlEl.children[1].value = value;
        },

        /**
        * Validate current input<br /><ul>
        *   <li>pattern (optional) {String}: ''</li>
        * </ul>
        * @function
        * @return {Boolean}
        */
        validate: function(pattern, callback) {
          var re;
          var value = this.getValue();
          var reEmail = /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i;
          var reUrl = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

          var result;
          if (typeof pattern != 'undefined') {
            re = new RegExp(pattern);
            result = re.test(value);
          } else {
            if ('email' == this.options.inputType) {
              re = new RegExp(reEmail);
              result = re.test(value);
            } else if ('url' == this.options.inputType) {
              re = new Regexp(reUrl);
              result = re.test(value);
            } else if ('text' == this.options.inputType) {
              result = value.length > 3;
            } else if ('password' == this.options.inputType) {
              result = value.length > 4;
            } else {
              result = value.length > 0;
            }
          }
          if (callback)
            callback(result);
          return result;
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
