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
        *   <li>value {String}: ''</li>
        *   <li>extraAttributes {Dictionary}: {}</li>
        * </ul>
        * @function
        * @return {Object} hash of options.
        */
        getDefaultOptions: function() {
          return _.extend(this.__super(), {
            'label': '',
            'inputType': 'text',
            'value': '',
            'extraAttributes': {}
          });
        },

        /**
        * Init data and set default selection
        * @function
        */
        init: function() {
          // Finish to merge the default options

          // Retro-compatibility purpose (added 2011-11-14, 0.9.1)
          var retroCompatibilityAttributes = {};
          if (this.options.required) retroCompatibilityAttributes.required = this.options.required;
          if (this.options.autofocus) retroCompatibilityAttributes.autofocus = this.options.autofocus;
          if (this.options.maxlength) retroCompatibilityAttributes.maxlength = this.options.maxlength;
          if (this.options.placeholder) retroCompatibilityAttributes.placeholder = this.options.placeholder;
          this.options.attributes = _.extend(this.options.extraAttributes || {}, retroCompatibilityAttributes);

          // Start initialization
          var self = this;
          self.__super();

          self.subscribe('afterInsert', function() {
            $('#' + self.htmlId + '_input').bind('focus', function() {
              self.app.ui.setState('focus', self.path);
            });
          });
        },

        /**
        * The html rendering of an input and its label. &lt;input type={this.attributes.inputType} required? value={this.attributes.value}&gt;
        * @function
        * @return {String} a classic &lt;input type=text|email|file|url|password|textarea /&gt;.
        */
        getInnerHtml: function() {
          var label = '<label for="' + this.htmlId + '_input">' + this.options.label + '</label>';

          var genericAttributes = '';
          _.each(this.options.extraAttributes, function(value, key) {
            switch (key) {
              case 'type': case 'value':
                /* ignore them */
                break;
              case 'maxlength':
                if (value) {
                  genericAttributes += ' onkeyup="this.value.length > '+value+' ? this.value = this.value.slice(0, ' + value + ') : true;" onchange="this.value.length > '+value+' ? this.value = this.value.slice(0, ' + value + ') :true;" ' + key + '="' + value + '" ';
                }
                break;
              default:
                if (typeof value === 'boolean') {
                  if (value) {
                    genericAttributes += '' + key + ' ';
                  }
                } else {
                  genericAttributes += '' + key + '="' + value + '" ';
                }
            }
          });
          
          if (this.options.inputType == 'textarea') {
            input = '<textarea ' +
                    'class="joshover josh-type-<%=type%> josh-id-<%=id%> <%= htmlClass %>" ' +
                    'id="' + this.htmlId + '_input" ' +
                    genericAttributes +
                    ' >' +
                    this.options.value +
                    '</textarea>';
          } else {
            input = '<input type="' + this.options.inputType + '" ' +
                    'class="joshover josh-type-<%=type%> josh-id-<%=id%> <%= htmlClass %>" ' +
                    'id="' + this.htmlId + '_input" ' +
                    genericAttributes + 
                    'value="' + this.options.value + '" ' +
                    '>';
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
