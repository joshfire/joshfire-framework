define(["joshlib!uielement","joshlib!vendor/underscore"], function(UIElement,_) {

  var UIHorizontalLayout = UIElement.extend({

    initialize:function(options) {
      UIElement.prototype.initialize.call(this, options);

      if(options.views) {
        this.setViews(options.views);
      }

      this.active = -1;
    },

    setViews: function(views) {
      this.views = views;
    },

    render: function() {
      _.each(this.views,function(v,k) {
        v.render();
      });
    },

    navFocus: function(origin) {
      UIElement.prototype.navFocus.call(this, origin, event);

      if(this.views.length) {
        this.activate(this.checkActive());
      }
    },

    navRight: function() {
      this.activate(Math.min(this.checkActive() + 1, this.views.length - 1));
    },

    navLeft: function() {
      this.activate(Math.max(this.checkActive() - 1, 0));
    },

    activate: function(num) {
      if(this.active != num) {
        this.views[num].navFocus(this);
        this.active = num;
      }
    },

    checkActive: function() {
      for (var i = this.views.length - 1; i >= 0; i--) {
        if($(this.views[i].el).hasClass('nav-focused') || this.views[i].$('.nav-focused')) {
          return i;
        }
      }

      return 0;
    }

  });

  return UIHorizontalLayout;

});