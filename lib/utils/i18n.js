/*!
 * Joshfire Framework 0.9.1
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Thu Jun 07 12:38:42 2012
 */
define(['joshlib!class', 'joshlib!vendor/underscore', 'joshlib!utils/dollar'], function(Class, _, $) {
  
  var i18nClass = Class(
    {

      // Current Dict.
      terms: null,

      // Sets the locale property and loads the json file.
      setLocale: function(opt, cb) {
        var self = this;
        
        self.opt = _.defaults(opt, {
          'url': './lang/dictionaries',
          'locale': self._detectLocale(),
          'format': 'json'
        });
        _.extend(this, opt);

        if(self.locale.toLowerCase() === 'auto')
          self.locale = self._detectLocale();

        var fileUrl = self.url+'/'+self.locale+'.'+self.format;

        if(document.location.toString().indexOf('file://') == -1) {
          $.ajax({
            url: fileUrl,
            dataType: 'json',
            success: function(data, status, jqxhr) {
              if(data && data.terms)
                self.terms = data.terms;
              else
                console.warn('JSi18n : No dictionary was loaded.');

              if(typeof cb === 'function')
                cb();
            }
          });
        }
        else {
          self.terms = {};
          if(typeof cb === 'function')
            cb();
        }
      },

      getLocale: function() {
        return this.locale;
      },

      /**
      * Returns the first occurence of the key in the terms.
      * If there is none, return the key itself.
      **/
      getText: function(key) {
        var self = this;
        for(var k in self.terms) {
          if(self.terms.hasOwnProperty(k)) {
            if(key.toLowerCase() == k.toLowerCase()) {
              return self.terms[k];
            }
          }
        }
        return key;
      },

      /**
      * Search for tags with the data-translate attribute
      * and translate their content. The data-translate
      * attribute is removed, making it easier to call
      * it again should new content be added.
      **/
      translateStaticContent: function() {
        var self = this;
        $('*[data-translate]').each(function() {
          $(this).removeAttr('data-translate');
          $(this).html(self.T($(this).html()));
        });
      },

      /**
      * Returns only the first
      **/
      _detectLocale: function() {
        var lan = (navigator.language) ? navigator.language : navigator.userLanguage;
        return (lan.split('-').length>1)?lan.split('-')[0]:lan;
      }
    }
  );

  var i18n = new i18nClass();
  
  return {
    getText:    _.bind(i18n.getText, i18n),
    setLocale:  _.bind(i18n.setLocale, i18n),
    getLocale:  _.bind(i18n.getLocale, i18n)
  };
  
});
