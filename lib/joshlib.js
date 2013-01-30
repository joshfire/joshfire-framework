/**
 * @fileOverview Defines the require.js plugin used to reference modules of
 * the Joshfire framework.
 *
 * This plugin responds to dependencies paths such as "joshlib![module]".
 *
 * It cannot be used directly without first setting the right parameters on the
 * global Joshfire.framework object. In particular, the code needs to access:
 * - Joshfire.framework.adapter: the selected adapter
 * - Joshfire.framework.adapterDeps: the list of adapters the selected adapter
 * directly depends on (note the order in the array creates the hierarchy, the
 * first adapter in the array being the direct parent of the selected adapter,
 * the second its great parent and so on)
 * - Joshfire.framework.adapterModules: a table indexed by adapter name that
 * lists the modules defined by each adapter.
 *
 * Given a module name [name], the plugin returns:
 * 1. "joshfire-framework/[xxx]" if [name] is of the form "adapters/none/[xxx]".
 * This use case lets modules depend on their base module without entering an
 * infinite loop where this plugin gets called indefinitely
 *
 * 2. "joshfire-framework/[name]" if [name] starts with "adapters/". This lets
 * modules references other adapters directly.
 *
 * 3. "joshfire-framework/adapters/[xxx]/[name]" if [name] is found in the list
 * of modules of the selected adapter or of one of its direct dependencies.
 *
 * 4. "joshfire-framework/[name]" otherwise, which typically happens for modules
 * that are not overridden in any adapter.
 *
 * For an explanation of require.js plugin functions, see:
 * http://requirejs.org/docs/plugins.html#api
 */
/*global define, Joshfire*/

define('joshlib', {
  normalize: function (name) {
    var path = 'joshfire-framework/';
    var adapters = [Joshfire.framework.adapter].concat(
      Joshfire.framework.adapterDeps);
    var modules = Joshfire.framework.adapterModules;

    if (name.substring(0,14) === 'adapters/none/') {
      // The name targets a base module (through the specific "none" adapter),
      // return the base class
      return path + name.substring(14);
    } else if (name.substring(0,9) === 'adapters/') {
      // The name targets another adapted module
      return path + name;
    }

    // Move up through the hierarchy of adapters created by the selected adapter
    // (starting with the selected adapter itself) and check whether there's an
    // adapted module that matches the requested name each time
    for (var i = 0; i < adapters.length; i++) {
      for (var y = 0; y < modules[adapters[i]].length; y++) {
        if (name === modules[adapters[i]][y]) {
          return path + 'adapters/' + adapters[i] + '/' + name;
        }
      }
    }

    // No adapted module available for this module, use the default one
    return path + name;
  },

  load: function (name, req, load) {
    req([name], function (value) {
      load(value);
    });
  }
});