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

Joshfire.define(['joshfire/class', 'joshfire/vendor/jquery', 'joshfire/vendor/underscore', 'joshfire/vendor/historyjs/history', 'joshfire/vendor/historyjs/history.adapter.jquery'], function(Class, $, _) {
  return Class(/** @lends adapters_browser_utils_navigation.prototype */ {
    /**
    * @class Navigation helper for intercepting clicks and HTML5 history support
    * @constructs
    * @param {app} app Reference to the app.
    * @param {Object} options Options hash.
    */
    __constructor: function(app,options) {
      this.app = app;
      this.options = options;

      if (History.enabled) {
        this.listenToHistory();
        this.interceptNavigation();
      }
    },

    interceptNavigation: function() {
      var self = this;

      //TODO other elements than <a> ?
      $('a[data-ajax!="false"]').live('click', function(ev) {
        // Bailout if ctrl or cmd key were pressed while clicking on the link
        // because the user wants to open the link in a new tab/window.
        if (ev.ctrlKey || ev.metaKey) {
          return true;
        }

        // First detect the HREF that was supposed to happen

        //TODO improve this
        var href = $(ev.target).closest('a')[0].href;

        if (!href) {
          return true;
        }

        var ret = self.followLink(href);

        if (!ret) {
          // Prevent regular navigation
          ev.preventDefault();
        }

        return ret;
      });
    },

    followLink: function(href) {
      // Check if it's an anchor #link
      // We bailout on all anchors for now, TODO check how to manage them
      if (href.indexOf('#') >= 0) {
        return true;
      }

      // Check if it's an external link

      //TODO configuration of allowed inner domains
      var regexp_in = new RegExp('(^\/)|(^(https?:\/\/)?' + window.location.hostname + ')');

      if (!regexp_in.test(href)) {
        //window.open(href);
        return true;
      }

      var relativeHref = href.replace(/^http\:\/\/([^\/]+)/, '');

      //TODO check UTF8 issues?
      this.navigateTo(decodeURIComponent(href));

      return false;
    },

    navigateTo: function(href) {
      if (History.emulated.pushState) {
        // History.js is disabled for this browser.
        // This is because we can optionally choose to support HTML4 browsers or not.
        window.location.href = href;
      } else {
        History.pushState(null, null, href);
      }
    },

    listenToHistory: function() {
      var self = this;

      History.Adapter.bind(window, 'statechange', function() {
        // Note: We are using statechange instead of popstate
        var State = History.getState();

        self.app.setStates({
          'uri': State.hash
        });
      });

      self.app.setStates({
        'uri': History.getState().hash
      });
    }
  });
});
