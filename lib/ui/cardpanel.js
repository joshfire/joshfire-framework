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

define([
  'joshlib!ui/layout',
  'joshlib!vendor/underscore',
  'joshlib!utils/i18n',
  'joshlib!utils/dollar',
  'joshlib!utils/woodman'
], function(UILayout, _, i18n, $, woodman) {
  var logger = woodman.getLogger('joshfire.framework.ui.cardpanel');

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
      options = options || {};

      // Initialize the instance ID for logging purpose as needed
      this.initializeLogId(options);
      logger.log(this.logid, 'initialize');

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
      if (this.currentChild === name) {
        logger.log(this.logid, 'show child', 'name=' + name, 'already active');
        return;
      }

      // Only do this after render has been called, since it might depend on
      // the DOM.
      if (!this.rendered) {
        logger.log(this.logid, 'show child', 'name=' + name, 'not rendered');
        this.currentChild = name;
        return;
      }

      logger.log(this.logid, 'show child', 'name=' + name, 'run transition');
      this.transition(this.currentChild, name);
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
     * @param {String} fromChild the name of old child
     * @param {String} toChild the name of new child
     */
    transition: function (fromChild, toChild) {
      logger.log(this.logid, 'transition',
        'from=' + fromChild, 'to=' + toChild);

      _.each(this.children, function (child, name) {
        if (name !== toChild) {
          child.hide();
        }
      });

      if (toChild) {
        this.children[toChild].show();
      }
    },

    setChildrenElements: function () {
      _.each(this.children, function(child, name) {
        var wrapper = this.$el.find('.joshfire-wrapper').get(0);
        var el = wrapper.childNodes[this.childrenOffsets[name]];
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

      if(!this.el.parentNode) return;

      this.children = this.children || {};
      this.children[name] = view;
      this.numChildren += 1;

      // Make "load" event from child "bubble".
      // Rules are:
      // - when the view is rendered, the "load" event is triggered once
      // all of its children have triggered the "load" event
      // - when the view is not rendered, the "load" event is triggered
      // whenever a child triggers a "load" event (the view cannot tell
      // whether more than one children are rendered, so it bubbles events
      // individually)
      this.listenTo(view, 'load', function () {
        if (this.rendering) {
          ++this.numChildrenLoaded;
          if (this.numChildrenLoaded === this.numChildren) {
            // All children have been loaded
            this.rendering = false;
            if(!this.wantsCustomLoadEvent) this.trigger('load');
          }
        }
        else {
          if (!this.wantsCustomLoadEvent) this.trigger('load');
        }
      });

      if (!this.rendered) return;

      this.childrenOffsets = this.childrenOffsets || {};
      this.childrenOffsets[name] = this.childrenOffsets ? _.size(this.childrenOffsets) : 0;
      view.hide();
      view.generate(_.bind(function (err, innerHTML) {
        var outerHTML = view.wrapContent(innerHTML);
        // Adds a data-joshfire-child attribute to the first node of the outerHTML.
        // The regexp is a light matching of the start of an html tag.

        outerHTML = outerHTML.replace(/<([^\/][^ >\/]+)/, '<$1 data-joshfire-child="' + name + '"');
        self.$('.joshfire-wrapper').append(outerHTML);

        // Set child view element
        var wrapper = this.$el.find('.joshfire-wrapper').get(0);
        var el = wrapper.childNodes[this.childrenOffsets[name]];
        view.setElement(el, true);

        // Enhance the view element
        view.enhance();
      }, this));
    },

    removeChild: function(name) {
      var rc = this.children[name];
      if(rc) {
        delete this.children[name];
        rc.el.parentNode.removeChild(rc.el);
        this.setChildrenOffset();
      }
    },

    setChildrenOffset: function() {
      var wrapper = this.$el.find('.joshfire-wrapper').get(0);
      var els = wrapper.childNodes;
      var childrenNames = _.keys(this.children);

      this.childrenOffsets = {};
      for(var k in els) {
        if(els.hasOwnProperty(k)) {
          var childName = $(els[k]).data('joshfire-child');
          if(_.contains(childrenNames, childName)) {
            this.childrenOffsets[childName] = k;
          }
        }
      }
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
    generate: function (cb) {
      logger.log(this.logid, 'generate');

      this.childrenOffsets = {};
      this.numChildrenLoaded = 0;
      var accumulator = 0;
      var childrenOuterHTML = '';
      var childrenHTML = {};
      var getFinalHTML = function(coh) {
        coh = coh || '';
        var childrenOuterHTML = '<div class="joshfire-wrapper">' + coh + '</div>',
            html = null;

        if (this.template) {
          var context = {
            childrenOuterHTML: childrenOuterHTML,
            childrenHTML: childrenHTML,
            T: i18n.getText
          };
          _.extend(context, this.data);
          html = this.template(context);
        }
        else {
          html = childrenOuterHTML;
        }

        return html;
      };

      if(!this.children || _.size(this.children) === 0) {
        var html = getFinalHTML(childrenOuterHTML);
        cb(null, html);
      }

      _.each(this.children, function (child, name) {
        child.generate(_.bind(function (err, innerHTML) {
          var outerHTML = child.wrapContent(innerHTML);
          this.childrenOffsets[name] = accumulator;
          childrenHTML[name] = outerHTML;
          childrenOuterHTML += outerHTML;

          if(++accumulator === this.numChildren) {
            var html = getFinalHTML(childrenOuterHTML);
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
      logger.log(this.logid, 'enhance');

      UILayout.prototype.enhance.call(this);

      // Set the wrapper's height to 100% so that it fills its
      // parent and remains transparent from an layout perspective.
      this.$('.joshfire-wrapper').first().css({
        height: '100%'
      });

      if(this.currentChild) {
        this.transition(null, this.currentChild);
      }
    },

    scrollTopChildren: function() {
      logger.log(this.logid, 'scroll top');
      if (this.currentChild) {
        this.children[this.currentChild].scrollTop();
      }
    }
  });

  return CardPanel;
});
