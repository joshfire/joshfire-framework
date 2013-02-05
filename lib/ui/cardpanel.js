/**
 * @fileoverview The CardPanel UI element wraps multipe chidren views, and
 * make one of them visibile via `showChild`.
 *
 * Usage example:
 *  var cardPanel = new CardPanel({
 *    children: {
 *      card1: myFirstView,
 *      card2: mySecondView
 *    }
 *  });
 *  cardPanel.showChild('card1');
 *  cardPanel.render(); // Render only needs to be called once
 *  ...
 *  cardPanel.showChild('card1'); // No render needed afterwards
 */

/*global define*/

define(['joshlib!ui/layout','joshlib!vendor/underscore'], function(UILayout, _) {

  /**
   * Definition of the CardPanel class.
   *
   * The class extends UIItem and automatically renders the underlying model
   * when it is updated.
   *
   * @class
   */
  var CardPanel = UILayout.extend({
    /**
     * Element initialization.
     *
     * Called once when the element is created.
     *
     * @function
     * @param {Object} options Element options. Should at least define
     *  a "children" property and optionally a  "currentChild" property
     */
    initialize: function(options) {
      // Set the current active child. 'defaultChildren' is for legacy
      // support.
      this.showChild(options.currentChild || options.defaultChildren);

      UILayout.prototype.initialize.call(this, options);
    },

    /**
     * Sets the visibile child.
     *
     * @function
     * @param {String} the name of the child
     */
    showChild: function(name) {
      if(this.currentChild === name) return;

      // Only do this after render has been caled, since it might depend on
      // the DOM.
      if(this.canUseDOM) {
        this.transition(this.currentChild, name);
      }

      this.currentChild = name;
    },

    /**
     * Alias for `showChild` (legacy support).
     */
    showChildren: function(name) {
      this.showChild(name);
    },

    /**
     * Hides the current child, shows a new one. Override this function to
     * create transition effects.
     *
     * @function
     * @param {String} the name of old child
     * @param {String} the name of new child
     */
    transition: function(fromChild, toChild) {
      _.each(this.children, function(child, name) {
        if(name != toChild) {
          child.hide();
        }
      });
      toChild && this.children[toChild].show();
    },

    setChildrenElements: function () {
      _.each(this.children, function(child, name) {
        var el = this.el.getElementsByClassName('joshfire-wrapper')[0].childNodes[this.childrenOffsets[name]];
        child.setElement(el, true);
      }, this);
    },

    /**
     * Adds a view to the cardpanel and renders it.
     * This should be called whenever a developer needs to insert
     * a new child in the panel and also needs said panel to look
     * stable, meaning he cannot render the whole pannel to insert it
     * (which would/could create a undesirable visual effect).
     * This function hence generates the new child's content and appends
     * it to the existing html of the panel ; thus achieving some kind
     * of partial rendering.
     */
    addChild: function(name, view) {
      var self = this,
          newChildren = this.children || {};
      newChildren[name] = view;
      this.setChildren(newChildren);

      this.childrenOffsets = this.childrenOffsets || {};
      this.childrenOffsets[name] = this.childrenOffsets ? _.size(this.childrenOffsets) : 0;
      
      view.generate(_.bind(function (err, innerHTML) {
        var outerHTML = view.wrapContent(innerHTML);
        if(!self.el.childNodes.length) {
          self.render();
        } else {
          self.$('.joshfire-wrapper').append(outerHTML);
        }
        self.setChildrenElements();
      }, this));
    },

    /**
     * Generates the HTML code to render.
     *
     * It calls the `generate` function of the underlying children.
     *
     * @function
     * @param {function(Object,Object)} cb Callback function that receives
     *   the error if one occurred and the HTML to render otherwise
     */
    generate: function(cb) {
      if(!this.children) return cb(null, '');

      this.childrenOffsets = {};
      this.numChildrenLoaded = 0;
      var accumulator = 0;
      var childrenOuterHTML = '';
      var childrenHTML = {};

      _.each(this.children, function (child, name) {
        child.generate(_.bind(function (err, innerHTML) {
          var outerHTML = child.wrapContent(innerHTML);
          this.childrenOffsets[name] = accumulator;
          childrenHTML[name] = outerHTML;
          childrenOuterHTML += outerHTML;

          if(++accumulator === this.numChildren) {
            childrenOuterHTML = '<div class="joshfire-wrapper">' + childrenOuterHTML + '</div>';
            
            var html = null;
            if (this.template) {
              html = this.template({
                childrenOuterHTML: childrenOuterHTML,
                childrenHTML: childrenHTML
              });
            }
            else {
              html = childrenOuterHTML;
            }

            cb(null, html);
          }
        }, this));
      }, this);
    },

    /**
     * Enhances the resulting view in the DOM if needed.
     *
     * The function is called automatically when the element is done
     * rendering. It calls the "enhance" function of the underlying
     * children.
     *
     * @function
     */
    enhance: function() {
      UILayout.prototype.enhance.call(this);
      
      // Set the wrapper's height to 100% so that it fills its
      // parent and remains transparent from an layout perspective.
      this.$('.joshfire-wrapper').first().css({
        height: '100%'
      });

      if(this.currentChild) {
        this.transition(null, this.currentChild);
      }

      this.canUseDOM = true;
    }
  });

  return CardPanel;
});
