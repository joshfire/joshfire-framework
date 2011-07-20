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

Joshfire.require(['joshfire/class', 'joshfire/tree.ui', 'joshfire/app'],
	function(Class, UITree, App) {

		Joshfire.debug = true;

		var UI = Class(UITree, {

		    buildTree: function() {
		        var app = this.app;

		        return [

					{
						id: 'panel1',
						type: 'panel',
						hideOnBlur: true,
						content: 'Coucou'
					},
					{
						id: 'panel2',
						type: 'panel',
						hideOnBlur: true,
						content: 'Panel II'
					},
					{
						id: 'panel3',
						type: 'panel',
						hideOnBlur: true,
						content: 'Panel III'
					}
				];
			}
		});

	   var BasicFocus = new Class(App, {

	        id: 'basicfocus',

	        uiClass: UI,

	        setup: function(callback) {
				callback(null, true);
	        }
	    });
		window.myapp = new BasicFocus();

		test('Tests', function() {
			expect(11);

			window.myapp = new BasicFocus();

			module('Init app');
			notEqual(typeof myapp, 'undefined', 'App myapp existe');
			equals(myapp.id, 'basicfocus', 'App basicfocus initialisée');
			ok(myapp.ui instanceof myapp.uiClass, 'UI tree');
			equals(myapp.ui.lastFocusedPath, null, 'Aucun focus');
	start();
	stop();
			module('change focus');
			notEqual(myapp.ui.moveTo, null, 'moveto existe');

			myapp.ui.moveTo('focus', '/panel1');
			ok(myapp.ui.get('/panel1') !== null, 'myapp.ui.get(/panel1) ok');
			ok(myapp.ui.get('/panel1').element !== null, 'myapp.ui.get(/panel1).element ok');
			equals(myapp.ui.lastFocusedPath, '/panel1', 'Focus transmis à panel1');

			myapp.ui.moveTo('focus', '/panel2');
			equals(myapp.ui.lastFocusedPath, '/panel2', 'Focus transmis à panel2');
			equals($('#' + myapp.ui.element('/panel1').htmlId).css('display'), 'none', 'panel 1 caché');
			equals($('#' + myapp.ui.element('/panel2').htmlId).css('display'), 'block', 'panel 2 visible');



		});
		start();
	}
);
