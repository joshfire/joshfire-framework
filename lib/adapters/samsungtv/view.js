/**
 * @fileoverview Base View class for the Samsung adapter.
 *
 *
 */

/*global define*/

define([
  "../../view",
  "joshlib!vendor/backbone",
  "joshlib!vendor/underscore",
  "joshlib!utils/dollar",
  "joshlib!utils/widgetapi"
], function (View, Backbone, _, $, widgetAPI) {

  /**
   */
  var newView = View.extend({

    /*setContent: function(html) {
      try {
        widgetAPI.putInnerHTML(this.el, html);
      } catch(e) {
        View.prototype.setContent.call(this, html);
      }
    }*/

  });

  return newView;

});
