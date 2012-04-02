define(['joshlib!vendor/underscore']; 
	function (_){
		if (!Common || !Common.API){
			console.error('Samsung apis are not available on your device', window.navigator.userAgent);
		}
		return {
			keyCodes : new Common.API.TVKeyValue(), // remote control keys list
    		widgetAPI : new Common.API.Widget(), // Create Common module
    		pluginAPI : new Common.API.Plugin(),
		};

	}
);