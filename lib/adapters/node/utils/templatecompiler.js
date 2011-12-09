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

Joshfire.define(['joshfire/class', 'joshfire/vendor/underscore'], function(Class, _) {

  var mkdirp = function(path,mode) {
    if (!mode) mode = 0777;
    
    var parts= path.split("/");
    
    if (!parts[0]) {
        parts= parts.slice(1);
    }
    for (var i=0,l=parts.length; i<=l; i++) {
        var pathSegment = "/"+parts.slice(0,i).join("/");
        try {
            fs.statSync(pathSegment);
        } catch(e) {
            fs.mkdirSync(pathSegment, 0755);
        }
    }
  };

  var fs = Joshfire.nodeRequire('fs');

  return Class({

    /**
    * @constructs
    * @function
    * @param Object (options).
    */
    __constructor: function(options) {
      this.options = _.extend({
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g
      }, options);
    },

    // returns a javascript code *string*
    /**
    * @function
    * @param {Object} var
    * @return {Object} string.
    */
    compileToString: function(str) {
      _.templateSettings = {
        evaluate: this.options.evaluate,
        interpolate: this.options.interpolate
      };
      return _.template(str).func.toString().replace(/^function anonymous\(/, 'function(');
    },

    // returns an Ext XTemplate
    /**
    * @function
    * @param {Object} var
    * @return {Object} XTemplate.
    */
    compileToXTemplate: function(str) {
      _.templateSettings = {
        evaluate: this.options.evaluate,
        interpolate: this.options.interpolate
      };
      return JSON.stringify(str.replace(/<\%\=/g, '{').replace(/\%\>/g, '}'));
    },

    // returns an HTML Template
    /**
    * @function
    * @param {Object} var
    * @return {Object} HTML Template.
    */
    compileToJSONTemplate: function(str) {
      _.templateSettings = {
        evaluate: this.options.evaluate,
        interpolate: this.options.interpolate
      };
      return JSON.stringify(str);
    },

    // returns a CommonsJS-ready Template
    /**
    * @function
    * @param {Object} var
    * @return {Object} HTML Template.
    */
    compileToCommonjsTemplate: function(str) {
      _.templateSettings = {
        evaluate: this.options.evaluate,
        interpolate: this.options.interpolate
      };
      return _.template(str).func.toString().replace(/^function anonymous\(/, 'module.exports = function(');
    },


    wrapInRequireJs: function(str) {
      return 'Joshfire.define([],function() {return ' + str + '});';
    },
    /**
    * @function
    * @param {Object} string
    * @param {Object}
    * @param {Object}
    * @param {Object}
    */
    compileDir: function(dir, outputdir, cb) {

      var self = this;

      //todo not sync
      var files = fs.readdirSync(dir); //, function (err, files) {
      //if (err) return cb(err);
      mkdirp(outputdir + '/ext/');
      mkdirp(outputdir + '/js/');
      mkdirp(outputdir + '/json/');
      mkdirp(outputdir + '/commonjs/');
      
     var cnt, basename, tpl;
     
     for (var i = 0; i < files.length; i++) {
     
       cnt = fs.readFileSync(dir + files[i], 'utf-8'); //,function(err,cnt) {
       //if (!err) {
       basename = files[i].replace(/\.[a-z0-9]+$/, '');

       tpl = self.wrapInRequireJs(self.compileToString(cnt));
       fs.writeFileSync(outputdir + '/js/' + basename + '.js', tpl);
     
       tpl = self.compileToXTemplate(self.compileToString(cnt));
     
       fs.writeFileSync(outputdir + '/ext/' + basename + '.js', tpl);
     
     
       tpl = self.compileToJSONTemplate(self.compileToString(cnt));
     
       fs.writeFileSync(outputdir + '/json/' + basename + '.js', tpl);
     
       tpl = self.compileToCommonjsTemplate(cnt);
     
       fs.writeFileSync(outputdir + '/commonjs/' + basename + '.js', tpl);
     
       //}
       //});
     }
     //});
     cb(null, true);
     
    }

  });

});
