// Normally your only modification will be on this value
// it will overwrite the J.basePath value
var sBaseServer = 'BASEURL',
	// http://192.168.0.101:40005/
    bUseLocalCache = false; // when getting content from an URL, will use the local cache or not

// global namespace, you can use it to access to the instanciated Samsung APIs if you need special behaviour
var samsungJoshfire = {
    oXHR : null,
    oXHRTimer:null,
    oKeys : new Common.API.TVKeyValue(), // remote control keys list
    widgetAPI : new Common.API.Widget(), // Create Common module
	pluginAPI : new Common.API.Plugin(),
	TVNavigationAPI:null, // link to the Volume interface
	TVInfoAPI:null, // link to the hardware information API
    oVideoElement : {
		sId:'joshfire-myskreen-samsung-player',
		sIdWindow:'joshfire-myskreen-samsung-tv-window',
		oElement:null, // will be replaced by the Samsung video plugin object
		oElementWindow:null, // reference to the Samsung middleware
		oElementWindowSource:null, // reference to the Samsung middleware
		OnBufferingProgress:function( iPercent ){},// replace with your callback
		OnBufferingStart:function() {},
		OnRenderingComplete:function() {}, // sent by media player when it reaches to the end of strea
		OnCurrentPlayTime:function( iMilliSeconds ){},// replace with your callback
		OnBufferingComplete:function(){},
		OnRenderError:function( e ) { },
		OnStreamNotFound:function( ) { },
		OnConnectionFailed:function( ) { },
		OnNetworkDisconnected:function() { },
		OnStreamInfoReady:function() {} // When metadata are received
	},
    getLatestVersionfor : function( sURL, sFileID, fSuccess ) {
        // get from the cache
        if( bUseLocalCache === true) {
            var sContent = samsungJoshfire.readFromFileID(sFileID);
        } else {
            var sContent = false;
        }
        
        // Samsung requires the previous XHR to be destroyed before using a new one
        if( samsungJoshfire.oXHR != null )
            samsungJoshfire.oXHR.destroy();
        // 
        samsungJoshfire.oXHR = new XMLHttpRequest();
        samsungJoshfire.oXHR.onreadystatechange = function () {
		if (samsungJoshfire.oXHR.readyState == 4) {
			if(samsungJoshfire.oXHR.status == 200) {	
				if( bUseLocalCache === true) {	
					samsungJoshfire.writeToFileID( sFileID, samsungJoshfire.oXHR.responseText );
				}
				return fSuccess.call( this, samsungJoshfire.oXHR.responseText);
				//return sContent = samsungJoshfire.oXHR.responseText;
			} else {
				displayNetworkError( samsungJoshfire.oXHR.status );
				return sContent = false;
			}
		}
	};
	samsungJoshfire.oXHR.onerror = function(e) { displayNetworkError( e ); };
        
        // nothing in cache ? synchronous request
        if( sContent === false) {
		alert(' there is nothing in cache, get it from '+sURL);	
		samsungJoshfire.oXHR.open('GET', sURL, true);
	} else { // something is cached ? async request to have the latest version for next time
		alert('there was something in cache for URL '+sURL);
		//setTimeout( function() {
		samsungJoshfire.oXHR.open('GET', sURL, true);	
		//}, 0);
	}
	// set the connection timeout to 5s
	samsungJoshfire.oXHRTimer = setTimeout(function() {
		if(samsungJoshfire.oXHR.status != 200 ) {
			samsungJoshfire.oXHR.abort();
			displayNetworkError( 'timeout');
		}
	}, 25000 );
	samsungJoshfire.oXHR.send(null);
	
	return sContent;
    },
    /**
    * stores locally a content in a file. Be careful because Samsung does not provide a way to know if the quota storage has been exceeded, and all the applications share the same disk
    * @param sFileID {string} a unique file reference
    * @param sText {string} the content of the file to write
    */
    writeToFileID : function( sFileID, sText ) {
        var fileSystemObj = new FileSystem();
        fileSystemObj.createCommonDir(curWidget.id);
        fileSystemObj.deleteCommonFile(curWidget.id + '/'+ sFileID);
        var fileObj = fileSystemObj.openCommonFile(curWidget.id + '/'+ sFileID, 'w');
        fileObj.writeAll( sText );
        fileSystemObj.closeCommonFile(fileObj);
        alert('written to '+ sFileID );
        return true;
    },
    /**
    * retrieve the content of a locally stored file
    * @param sFileID {string} a unique file reference
    * @return {string|false}
    */
    readFromFileID:function( sFileID ) {
        alert( 'readFromFileID '+sFileID+' start');
        var fileSystemObj = new FileSystem();
        var fileObj = fileSystemObj.openCommonFile(curWidget.id + '/'+ sFileID, 'r');
        if( !fileObj ) {
            //fileSystemObj.closeCommonFile(fileObj);
        alert( 'readFromFileID '+sFileID+' end, was empty');
            return false;
        } else {
            var sContent = fileObj.readAll();
            fileSystemObj.closeCommonFile(fileObj);
        alert( 'readFromFileID '+sFileID+' end, was there');
            return sContent;
        }
    }
};


var init = function() {
    // 
/*	var sCSSRules = samsungJoshfire.getLatestVersionfor( sBaseServer+'solder/couchmode-web.css', 'couchmode.css' );
 // The Mapple browser seems unable to inject CSS into the DOM
	var	oStyle = document.createElement('style');
	oStyle.type = 'text/css';
	// code taken from http://developer.yahoo.com/yui/docs/stylesheet.js.html
	if (oStyle.styleSheet) {
		oStyle.styleSheet.cssText = sCSSRules;
	} else {
		oStyle.appendChild(document.createTextNode(sCSSRules));
	}
	document.getElementsByTagName('head')[0].appendChild(oStyle);
*/
//alert( oStyle.sheet.cssRules[0].cssText );

	//alert(document.domain );
	
	/*samsungJoshfire.getLatestVersionfor( 
		sBaseServer+'solder/couchmode-samsung23.js?no-minify', 
		'couchmode.js',
		function( sResponse) {
			eval( sResponse );
			*/
			if( !window.Joshfire )
				return displayNetworkError( 'Joshfire Framework is absent' );
			// correct the server path
			Joshfire.basePath = sBaseServer;
			window._app.insert();
	//	} );

/*	var sCSSUrl = sBaseServer+'solder/couchmode-samsung23.css';
	samsungJoshfire.getLatestVersionfor(sCSSUrl, 'couchmode.css'  );
	var oStyle = document.createElement('link');
	oStyle.type = 'text/css';
	oStyle.rel = 'stylesheet';
	oStyle.href = sCSSUrl;
	setTimeout( function() {
			document.getElementsByTagName('head')[0].appendChild(oStyle);
		}, 2000 );
*/
	// alert( sJS );
	//eval( sJS );


	
	//_app.api.postProxy = null;

//alert('basePath =' + Joshlib.basePath );
	//document.body.className = '';
//alert( document.body.className );
};

var oPIN;


function displayNetworkError( message ) {
	alert( message );
	document.body.className = 'loading';
	samsungJoshfire.widgetAPI.putInnerHTML( document.getElementById('error-message'), message );
	//document.getElementById('error-message').innerHTML = message;
};



document.body.onload = function () { 

    alert("body loaded"/*+window.innerHeight*/ );
// window.onShow = onShowEvent ;

	//	 // Send ready message to Application Manager

//function onShowEvent ()	{
	samsungJoshfire.oVideoElement.oElement = document.getElementById( samsungJoshfire.oVideoElement.sId );
	samsungJoshfire.oVideoElement.oElement.OnBufferingProgress	= 'samsungJoshfire.oVideoElement.OnBufferingProgress';
	samsungJoshfire.oVideoElement.oElement.OnCurrentPlayTime	= 'samsungJoshfire.oVideoElement.OnCurrentPlayTime';
	samsungJoshfire.oVideoElement.oElement.OnBufferingComplete	= 'samsungJoshfire.oVideoElement.OnBufferingComplete';
	samsungJoshfire.oVideoElement.oElement.OnRenderError		= 'samsungJoshfire.oVideoElement.OnRenderError';
	samsungJoshfire.oVideoElement.oElement.OnStreamNotFound		= 'samsungJoshfire.oVideoElement.OnStreamNotFound';
	samsungJoshfire.oVideoElement.oElement.OnConnectionFailed	= 'samsungJoshfire.oVideoElement.OnConnectionFailed';
	samsungJoshfire.oVideoElement.oElement.OnNetworkDisconnected	= 'samsungJoshfire.oVideoElement.OnNetworkDisconnected';
	samsungJoshfire.oVideoElement.oElement.OnBufferingStart		= 'samsungJoshfire.oVideoElement.OnBufferingStart';
	samsungJoshfire.oVideoElement.oElement.OnRenderingComplete	= 'samsungJoshfire.oVideoElement.OnRenderingComplete';
	samsungJoshfire.oVideoElement.oElement.OnStreamInfoReady	= 'samsungJoshfire.oVideoElement.OnStreamInfoReady';
//alert( samsungJoshfire.oVideoElement.sIdWindow );
	samsungJoshfire.oVideoElement.oElementWindow = document.getElementById( samsungJoshfire.oVideoElement.sIdWindow );
	samsungJoshfire.TVNavigationAPI = document.getElementById('pluginObjectNNavi');
	samsungJoshfire.TVInfoAPI = document.getElementById('joshfire-myskreen-samsung-infos');
//alert( window._app );
	if( !window.Joshfire )
		return displayNetworkError( 'Joshfire Framework is absent' );

	Joshfire.basePath = sBaseServer;
	
//alert(samsungJoshfire.oVideoElement.oElementWindow);
//alert(document.cookie = 'blag');
	
    // does not work completely work
	//setTimeout( init, 5000);
    //setTimeout('init()', 0);
	//init();
	document.body.className = "";
  // APPID dinamically replaced by the first value of modules.js.include in build.js, who should be the app
  Joshfire.require('APPID', function(App) {
		window._app = new App();
	});
    
	//window._app.insert();
//};

//onShowEvent();
	/*setTimeout( function(){
			window._app.insert();
		},1000);
	*/
return;
}; // fin onload
