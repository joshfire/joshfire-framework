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

Joshfire.define(['../../uielement', 'joshfire/class', 'joshfire/vendor/underscore'], function(UIElement, Class, _) {


  var _id = function(elt) {
    return document.getElementById(elt);
  };

  var _oldDisplayValue = 'block';

  return Class(UIElement, {

    getDefaultOptions: function() {
      return _.extend(this.__super(), {});
    },

    remove: function() {
      $('#' + this.htmlId).remove();
    },

    insertInParent: function(parentElement) {
      this.__super();
      if (!_id(this.htmlId)) {
        $(this.parentInnerHtmlEl).append(this.getHtml());
      }
      this.htmlEl = _id(this.htmlId);
      this.innerHtmlEl = _id(this.innerHtmlId);
      /*
      if (!_id(this.htmlId)) {

        // TODO This sometimes fails on iPad. Report this bug on zepto.
        //$(this.parentHtmlEl).append(this.getHtml());

        var div = document.createElement('div');
        div.innerHTML = this.getHtml();
        this.parentInnerHtmlEl.insertBefore(div);

      }

      this.htmlEl = _id(this.htmlId);
      this.innerHtmlEl = _id(this.innerHtmlId);
      */
    },


    /**
    * Refresh data in the UIElement
    * @function
    * @param {Function} callback callback when refreshed.
    */
    refresh: function(callback) {

      if (!_id(this.htmlId) || !_id(this.htmlId).id) {
        if (this.options.autoInsert === true) {
          this.insert(this.parentEl);
        }
      } else {

        //console.log("refresh",this.innerHtmlEl);
        //this.innerHtmlEl.innerHTML = this.getInnerHtml();

        //this.insertChildren(true);

      }
      this.__super(callback);
    },
    /**
    * Show the element right away
    * @function
    */
    show: function() {
      this.publish('beforeShow', null, true);
      this._show();
      this.publish('afterShow');
      this.showHideSwitch.off();
    },

    /**
    * Hide the element right away
    * @function
    */
    hide: function() {
      this.publish('beforeHide', null, true);
      this._hide();
      this.publish('afterHide');
      this.showHideSwitch.off();
    },
    _show: function() {
      if (!_id(this.htmlId)) return;
      _oldDisplayValue = _id(this.htmlId).style.display;
      _id(this.htmlId).style.display = 'block';
    },

    _hide: function() {
      if (!_id(this.htmlId)) return;
      _oldDisplayValue = _id(this.htmlId).style.display;
      _id(this.htmlId).style.display = 'none';
    }

  });

});
