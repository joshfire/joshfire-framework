define(["joshlib!ui/list","joshlib!utils/dollar","joshlib!vendor/underscore"], function(UIList,$,_) {

  var UIToolbar = UIList.extend({

    tagName: 'div',
    className: 'joshfire-toolbar',

    initialize: function(options) {

      options.scrollOptions = {
        hScroll:false,
        vScroll:true
      };

      UIList.prototype.initialize.call(this, options);
    }

  });

  return UIToolbar;
});