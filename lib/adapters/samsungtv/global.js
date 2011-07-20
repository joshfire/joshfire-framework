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

(function(J) {

  J.adapterDeps = ['browser'];


  // for Samsung, redefine console.log to route it to alert(), to have debug in the samsung SDK
  //alert('global.js');
  if (!window.console) {// detect if launched from the Samsung application environment
    //alert('global2.js');
    /**
    * @ignore
    */
    console = {
      /**
      * @ignore
      */
      log: function(sMessage) {
        // here is a filter to display only the video related logs
        /*if(!sMessage.match( /^Samsung23Player|VIDEO/ ) )
        return;
        */
        var aOutput = [];
        for (var i = 0, iLength = arguments.length; i < iLength; i++) {
          if (typeof arguments[i] === 'string')
            aOutput.push(arguments[i]);
          else
            //aOutput.push( JSON.stringify( arguments[i]) );
            aOutput.push(arguments[i]);//JSON.stringify( arguments[i]) );
        }
        //var args = Array.prototype.slice.call(arguments);
        // use this to debug in the TV : it directly outputs the log in the infobull DIV
        /*if(document.getElementById('couchmode_e_infobulle')) {
        iLogs.unshift( 'LOG: '+ aOutput.join(', ') );
        iLogs = iLogs.slice(0, 12);
        //document.getElementById('couchmode_e_infobulle').innerHTML = iLogs.join('<br>');
        samsungJoshfire.widgetAPI.putInnerHTML(document.getElementById('couchmode_e_infobulle'), iLogs.join('<br>') );
        } else {
        */
        // for the emulator, that is enough
        alert('LOG: ' + aOutput.join(', '));
        //}
      },
      /**
      * @ignore
      */
      error: function(sMessage) {
        var args = Array.prototype.slice.call(arguments);
        console.log('console ERROR: ', args.join(', '));
      },
      /**
      * @ignore
      */
      warn: function(sMessage) {
        var args = Array.prototype.slice.call(arguments);
        console.log('console WARN: ', args.join(', '));
      }
    };
    var iLogs = [];
    // those 2 lines crash the emulator (but not the TV)
    //samsungJoshfire.pluginAPI.setOffScreenSaver();
    //samsungJoshfire.pluginAPI.setOffIdleEvent();
  }

})(Joshfire);
