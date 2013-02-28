# Joshfire framework
Open Source Multi-device JavaScript framework created and maintained by [Joshfire](http://www.joshfire.com).

The current version of the framework builds upon [Backbone.js](http://backbonejs.org/) and [require.js](http://requirejs.org). Main features include:

- **common views** at the core of each application (e.g. layout, list, slide panel)
- an **adapter mechanism** to tweak the code of certain views when they are run on certain families of devices
- a **build system** to compile the JavaScript code of an application
- a **logging system** based on [Woodman](http://github.com/joshfire/woodman) with a pre-compiler to remove logging code before compilation to save size.
- a few **utility classes** for usual functionalities.

As opposed to previous versions of the framework, the current version does not impose a particular declaration mechanism for the structure of an app. The router/controller of the app is entirely up to the app developer.

Please note that, while the framework is actively being maintained, the "doc" and "examples" folders are leftovers of the previous version and do not match the current framework. In particular, the examples do not work. Documentation and examples will be updated when time allows...

The documentation of the deprecated previous version can still be checked in the v0.9 branch: https://github.com/joshfire/joshfire-framework/tree/old-master

# License
The Joshfire framework is licensed under an [MIT license](LICENSE) (even the classes that still refer to a dual GPL and Commercial licenses which merely need to be updated)