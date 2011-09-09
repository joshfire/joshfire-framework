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

Joshfire.define(['../../../uielements/panel.manager', 'joshfire/class', 'joshfire/vendor/underscore'], function(PanelManager, Class, _) {

  return Class(PanelManager, {

    route: function(route) {
      var self = this;

      self.setLoading(true);

      self.initView(route.target, function(err,viewInstance) {
        if (!err) {
          viewInstance.setLoading(true);
          viewInstance.insert(self);
          viewInstance.setStates(route);
          viewInstance.getFreshHtml(function(err,html) {
            if (err) {
              self.app.setHttpStatus(err.code);
            }
            console.log('FRESH MANAGER', err);
            viewInstance.setLoading(false);
          });
        }
        self.setLoading(false);
      });
    }

  });


});
