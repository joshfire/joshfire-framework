/**
 * @fileoverview Atomic view bound to a data model.
 *
 * The UIItem class is a basic view that is associated with a
 * Backbone model. The view is automatically refreshed when the
 * model changes (in other words, the view is rendered each time
 * a "change" event is triggered on the underlying model).
 *
 * There are two ways to bind the view to a model:
 * 1. when the view is created, passing a "model" property in the options:
 *  new UIItem({ model: foo });
 * 2. after the view has been created, through calls to the setModel function:
 *  view.setModel(foo);
 *
 * A UIItem class may also be given an HTML template (compatible with
 * Underscore's "template" function) or an element selector that targets
 * the HTML template in the DOM, e.g.:
 *  new UIItem({ template: "<h2><%= item.name %></h2>" });
 *  new UIItem({ templateEl: "#template-h2" });
 * ... provided #template-h2 is defined in the DOM for the second case,
 * typically in a "script" template:
 *  <script type="text/template" id="template-h2">
 *   <h2><%= item.name %></h2>
 *  </script>
 *
 * The variables exposed to the HTML context are:
 *  - model: the model associated with the view
 *  - item: a JSON representation of the Backbone model (in other words,
 *      the result of a call to model.toJSON())
 *  - all properties passed at creation step in a "data" property, e.g.:
 *      var view = new UIItem({
 *        templateEl: "#template-h2",
 *        data: { foo: "bar" }
 *      });
 *    would expose a "foo" variable to the HTML template whose value is "bar".
 *
 * Whenever possible, you should use the "data" mechanism to expose additional
 * properties to an HTML template in derivated views, as opposed to overwriting
 * the UIItem's "generate" function.
 */

/*global define*/

define([
  "joshlib!uielement",
  "joshlib!utils/dollar",
  "joshlib!vendor/underscore"
], function (UIElement, $, _) {

  /**
   * UIItem extends UIElement as all other views in the Framework.
   */
  var UIItem = UIElement.extend({
    /**
     * Initialization code that gets executed when the view is created.
     *
     * If set, the code initializes the HTML template and the model associated
     * with the view (as well as options taken care of by UIElement)
     *
     * @function
     * @param {Object} options View options. Properties understood on top
     *  of those of UIElement: "template" or "templateEl", "model".
     */
    initialize: function(options) {
      if (options.template){
        this.template = this.compileTemplate(options.template);
      }
      else if (options.templateEl) {
        this.template = this.compileTemplate($(options.templateEl).html());
      }

      this.setModel(options.model);

      UIElement.prototype.initialize.call(this, options);
    },


    /**
     * Binds the view to the given model.
     *
     * The function ensures that the view gets rendered whenever the model
     * is changed. It does not perform an initial rendering of the view
     * unless requested.
     *
     * @function
     * @param {Model} model Backbone model to bind to the view
     * @param {Boolean} render Perform an initial rendering of the view.
     */
    setModel: function(model, render) {
      this.model = model;

      if(model) {
        model.bind('change', this.render, this);
      }

      if(render) this.render();
    },


    /**
     * Generates the view's HTML content for the underlying model.
     *
     * The HTML content generated is the inner HTML of the view, i.e. it
     * does not include the wrapping element of the view (this.el).
     *
     * The function runs the HTML template if one is defined, exposing
     * the underlying model and data options.
     *
     * If no HTML template is defined, the function returns an empty string.
     * If no model is set, the function returns an empty string as well. This
     * last behavior allows to make certain assumptions in the HTML template,
     * not to clutter the code with ugly "<%= (foo ? foo.name : '') %>".
     *
     * @function
     * @param {function} cb Callback function called with an error or
     *  the HTML markup to render. The function never sets the error but note
     *  the HTML template may crash if it's invalid or if it makes wrong
     *  assumptions about the model.
     */
    generate: function(cb) {
      if (!this.template) {
        return cb(null, '');
      }

      if (!this.model) {
        return cb(null, '');
      }

      var context = {
        model:  this.model,
        obj: this.model,
        item: this.model ? this.model.toJSON() : {}
      };
      _.extend(context, this.data);

      cb(null, this.template(context));
    }
  });

  return UIItem;
});
