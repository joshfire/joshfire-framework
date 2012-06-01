
/*global define*/

define([
  "joshlib!vendor/backbone",
  "joshlib!vendor/underscore"
], function (Backbone, _) {

  /**
   * Base view in the Framework. All views in the framework extend this base class.
   *
   * The base view itself is an extension to Backbone views that introduces a
   * three-step asynchronous rendering logic on top of Backbone's "render" logic.
   */
  var newView = Backbone.View.extend({

    /**
     * Shortcut to underscore's templating function
     */
    compileTemplate: _.template,

    /**
     * Renders the view.
     *
     * This function should never need to be overwritten in derivated classes:
     * it implements the three-step generate / setContent / enhance logic.
     *
     * Rendering may be asynchronous, so there is no guarantee that rendering
     * is done when this function returns (although most views are rendered
     * synchronously in practice).
     *
     * @function
     * @return {newView} A reference to the current object for chaining purpose
     */
    render: function() {

      var self = this;
      this.generate(function(err,html) {
        // TODO: react on error!
        if (html!==false) self.setContent(html);
      });
    },

    setContent: function(html) {
      RESP[this.el.id]["html"] = html;
    },


    generate: function(cb) {
      cb(null, '');
    },


    /**
     * Returns the HTML content wrapped in the view's DOM element.
     *
     * The function returns the HTML content that would be returned by
     * a serialization of the DOM element associated DOM element
     * after a call to render.
     *
     * This function is useful for container views: such views should call
     * the wrapContent function of their children with the HTML content
     * returned by their generate function to compute the appropriate outerHTML
     * content for the child view without having to convert the HTML to
     * a DOM element and back to an HTML string.
     *
     *
     * Notes:
     * - the function does not alter the underlying DOM element in any way
     * since it could be rendered with other data when the function is called.
     * - the function would perhaps better be integrated as a flag parameter
     * of the generate function that container views must set when calling
     * their children's generate method. All views that override "generate"
     * would need to be updated, and that would not bring much difference
     * in the end (container views would need to remember to set the flag as
     * they need to remember to call wrapContent with this implementation),
     * so leaving it as is for now to reduce the amount of changes made to
     * the framework.
     *
     * @function
     * @param {string} innerHTML Inner HTML that is to be rendered.
     * @return {string} Wrapped content.
     */
    wrapContent: function(innerHTML) {
      innerHTML = innerHTML || '';

      // Helper function that escapes a string for inclusion in an HTML snippet
      var escapeHtml = function (str) {
        if (!str) return '';
        return str.replace(/&/g,'&amp;')
          .replace(/>/g,'&gt;')
          .replace(/</g,'&lt;')
          .replace(/"/g,'&quot;');
      };

      // Note Backbone normally guarantees that this.el is set, so the
      // following check should be useless in practice.
      if (!this.el) return '<div>' + innerHTML + '</div>';

      // Generate the wrapped content, using the DOM element's name and
      // attributes values.
      var outerHTML = '<' + this.el.nodeName.toLowerCase();
      _.each(this.el.attributes, function (attr) {
        // TODO: escape attributes values properly
        if (attr.value) {
          outerHTML += ' ' + attr.name + '="' + escapeHtml(attr.value) + '"';
        }
        else {
          outerHTML += ' ' + attr.name;
        }
      });
      outerHTML += '>' + innerHTML +
        '</' + this.el.nodeName.toLowerCase() + '>';
      return outerHTML;
    },

    /**
     * Hides the view's DOM element
     *
     * @function
     */
    hide: function() {
      RESP[this.el.id]["hidden"] = true;
    },

    /**
     * Shows the view's DOM element
     *
     * @function
     */
    show: function() {
      RESP[this.el.id]["hidden"] = false;
    },

    /**
     * Enhances the view with additional logic.
     *
     * Default implementation does not do anything. Override this function
     * in derivated classes as needed.
     *
     * @function
     */
    enhance: function() {

    },

    /**
     * Changes the view's element (`this.el` property), including event
     * re-delegation.
     *
     * This function is taken from Backbone v0.9.2 and will become
     * useless as soon as we migrate Backbone to that version (or above).
     *
     * @function
     * @param {Element} element The new DOM element to use for the view
     * @param {boolean} delegate Re-delegate events to the new element when set
     * @return {newView} A reference to the current object for chaining purpose
     */
    setElement: function(element) {
      this.el.id = element;
      return this;
    }
  });

  return newView;

});