/*!
 * Joshfire Framework 0.9.0
 * http://framework.joshfire.com/
 *
 * Copyright 2011, Joshfire
 * Dual licensed under the GPL Version 2 and a Commercial license.
 * http://framework.joshfire.com/license
 *
 * Date: Wed Jun 29 16:25:37 2011
 */


var build = {
  baseUrl: '../',
  name: 'exampleVideoList',
  dir: '../export/',
  modules: [
    {
  		name: 'leanback',
  		adapter: 'browser',
  		js: {
  			'include': [
  				'src/app',
  				// Dynamically loaded dependencies - not autodetectable
  				'joshfire/adapters/browser/uielements/video.youtube.swf',
  				'joshfire/adapters/browser/uielements/mediacontrols',
  				'joshfire/adapters/browser/uielements/list',
  				'joshfire/adapters/browser/inputs/mouse',
  				'joshfire/adapters/browser/inputs/keyboard'
  			]
  		},
  		css: {
  		  scss: 'css/leanback.scss'
  		}
  	},
  	{
  		name: 'leanback',
  		adapter: 'samsungtv',
  		js: {
  			include: [
  				'src/app',
  				//'joshfire/adapters/samsungtv/uielement',
  				//'joshfire/adapters/samsungtv/inputs/keyboard',
  				//'joshfire/uielement',
  				'joshfire/uielements/panel',
  				'joshfire/adapters/samsungtv/inputs/remote',
  				'joshfire/adapters/browser/uielements/list',
  				'joshfire/adapters/browser/uielements/mediacontrols',
  				'joshfire/adapters/samsungtv/uielements/video.mediaelement'
  			]
  		},
  		css: {
  		  scss: 'css/samsungtv.scss'
  		}
  	},
  	{
  		name: 'leanback',
  		adapter: 'android',
  		js: {
  			include: [
  				'src/app',
  				'joshfire/uielement',
  				'joshfire/uielements/panel',
  				//'joshfire/adapters/ios/inputs/touch',
  				'joshfire/adapters/android/uielements/list',
  				'joshfire/adapters/browser/uielements/mediacontrols',
  				'joshfire/utils/splashscreen',
  				'joshfire/adapters/android/uielements/video.mediaelement'
  			]
  		},
  		css: {
  		  scss: 'css/leanback.scss'
  		}
  	}

	]
};
