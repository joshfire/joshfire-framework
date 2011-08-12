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

Joshfire.define(['../../../uielements/panel.manager', 'joshfire/class', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore'], function(PanelManager, Class, $,_) {
  /**
  * @class Panel Manager implementation for browsers
  * @name adapters_browser_uielements_panel.manager
  * @augments uielements_panel.manager
  */
  return Class(PanelManager,
      /**
      * @lends adapters_browser_uielements_panel.manager.prototype
      */
      {
        /**
        * @function
        **/
        init: function() {
          this.__super();
          this.currentView = false;
        },


        setLoading: function(isLoading) {
          var self = this;

          this.setState('loading', isLoading);

          if (this.htmlEl) {

            if (isLoading) {

              //Show the loader if the element is still loading after .2s
              setTimeout(function() {
                if (self.getState('loading')) {
                  $(self.htmlEl).append("<div class='loading'>" + self.template(self.options.loadingTemplate + '</div>'));
                }
              },200);

            } else {
              $('#' + this.htmlId + ' .loading').remove();
            }
          }

        },


        /**
        * Routing
        * @function
        * @param {Object} string
        **/
        route: function(route) {
          var self = this;

          self.setLoading(true);
          self.initView(route.target, function(err,viewInstance) {
            self.setLoading(false);
            if (err) {
              console.log('manager got err', err);
            } else {
              self.routeView(viewInstance, route);
            }

          });
        },
        /**
        * Routing
        * @function
        * @param {Object} view
        * @param {Object} route
        */
        routeView: function(view,route) {
          var self = this;

          // Don't render when getting the page first, just enhance
          if (!this.currentView) {

            this.currentView = view;

            // Get dynamic data used to build the view, enhance() may need it
            // view.viewData = JSON.parse($("#"+this.currentView.htmlId).attr("joshfire-renderdata"));


            view.htmlEl = $('#' + this.currentView.htmlId)[0];
            view.innerHtmlEl = view.htmlEl;
            view.setState("inserted",true);
            view.parentUi = this;

            // Add dynamic behaviours to the page
            view.enhance();

          } else {

            view.transitionFrom(this.currentView);

            this.lastRequestedViewSequence = view.options.sequenceId;

            view.setStates(route);

            view.getFreshHtml(function(err,html) {
              // The callback came late, another view has already been requested, don't insert.
              if (view.options.sequenceId != self.lastRequestedViewSequence) {
                console.log('Skipping delayed callback', view.options.sequenceId, self.lastRequestedViewSequence);
                return;
              }

              view.insert(self);
              self.currentView.remove();
              self.currentView = view;
              view.enhance();

            });
          }
        }
      });
});
