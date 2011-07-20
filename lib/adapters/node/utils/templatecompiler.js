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

  var fs = Joshfire.nodeRequire('fs');

  var mkdirp = Joshfire.nodeRequire('mkdirp').mkdirp;

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
      return _.template(str).toString().replace(/^function anonymous\(/, 'function(');
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
      return _.template(str).toString().replace(/^function anonymous\(/, 'module.exports = function(');
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
      mkdirp(outputdir + '/ext/', parseInt('0755', 8), function(err) {
        mkdirp(outputdir + '/js/', parseInt('0755', 8), function(err) {
          mkdirp(outputdir + '/json/', parseInt('0755', 8), function(err) {
            mkdirp(outputdir + '/commonjs/', parseInt('0755', 8), function(err) {

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

            });
          });
        });
      });
    }

  });

});
