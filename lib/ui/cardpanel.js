define(["joshlib!uielement","joshlib!vendor/underscore"], function(UIElement,_) {
  
  var UICardPanel = UIElement.extend({

    initialize:function(options) {

      //TODO support for just passing a model
      //If a collection is given we'll only display the first item.
      if (options.children) {
        this.setChildren(options.children);
      }

      if (options.defaultChildren) {
        this.showChildren(options.defaultChildren);
      }

    },

    setChildren: function(children) {
      var self = this;

      this.children = children;
    },

    showChildren:function(childrenId) {
      //Hide all
      _.each(this.children,function(v,k) {
        if (k!=childrenId) {
          v.hide();
        }
      });
      this.children[childrenId].show();
    },

    render:function() {
      //No actual rendering happens on the cardpanel itself.
      _.each(this.children,function(v,k) {
        v.render();
      });
    }

  });

  return UICardPanel;

});