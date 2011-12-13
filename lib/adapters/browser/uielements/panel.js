Joshfire.define(['../../../uielements/panel', 'joshfire/class', 'joshfire/vendor/underscore'], function(Panel, Class,  _) {
  /**
  * @class Panel element for browsers
  * @name adapters_browser_uielements_panel
  * @augments uielements_panel
  */
  return Class(Panel,
     {
        type: 'Panel',
   /**
    * Get panel inner html. this.options.content || this.data.content
    * @function
    *
    */
    getInnerHtml: function() {
      if (this.options.itemTemplate){
        var tplFunc = (_.isFunction(this.options.itemTemplate)) ?  this.options.itemTemplate : _.template(this.options.itemTemplate);
        this.item = this.data || {};
        return content =tplFunc(this);
      } 
      if (this.options.content) {
        return this.options.content;
      } else {
        if (this.data && this.data.content) {
          return this.data.content;
        } else {
          return this.__super();
        }
      }
    }
  });
});