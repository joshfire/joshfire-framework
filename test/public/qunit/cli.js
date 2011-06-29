var util = require( "util" ),
    assert = require( "assert" ),
    $ = require('sharedjs');

var undefined,
    pause = false,
    queue = [],
    results = [],
    test,
    module = {},
    QUnit = {
        api: {}
    };

exports.QUnit = QUnit;


/**
 * Setup the env, run the test and then run the next one
 */
function run() {
    // all tests are done
    if ( queue.length <= 0 ) {
      
        QUnit.done(results);
        return;
    }

    test = queue[0];
    module = test.module;

    if ( module.env && module.env.setup && !test.setupDone ) {
        module.env.setup();
        test.setupDone = true;
    }

    // run the test
    if ( !pause ) {
        test.fn.call( QUnit.current_testEnvironment = $.extend( true, {}, module.env , test.env) );
    }

    if ( test.async ) {
        QUnit.api.stop();
    } else if ( !pause ) {
        testDone();
    }

    if ( !pause ) {
        run();
    }
}

/**
 * Do teardown and count expected assertions after each test is done
 */
function testDone() {

    if ( !test || !module ) {
        return;
    }

    if ( module.env && module.env.teardown && !test.teardownDone ) {
        module.env.teardown();
        test.teardownDone = true;
    }

    if ( pause ) {
        return;
    }

    // check if expected assertions count is correct
    if ( test.expected !== undefined && test.expected !== test.done ) {
        var errorStack;
        // trigger an error to get an error stack
        try {
            throw new Error( "Assertions amount" );
        } catch( err ) {
            errorStack = err.stack;
        }

        log({
            message: "Expected " + test.expected + " assertions, but " + test.done + " were run",
            errorStack: errorStack
        });
    }

    queue.shift();
}

/**
 * Collect results
 * @param {Object} res test result
 */
function log(res) {
    res.message = res.message || "";
    res.name = test.name || "";
    res.module = module.name || "";
    results.push(res);
}


/**
 * Begin tests execution
 */
QUnit.begin = function() {
    if ( queue.length <= 0 ) {
        throw new Error( "There are no tests defined" );
    }

    this.start();
};

/**
 * Callback for tests complete
 */
QUnit.done;

/**
 * Define current module name and environment
 * @param {String} name
 * @param {Object} env
 */
QUnit.api.module = function( name, env ) {

    env = env || {};

    module = {
        name: name,
        env: env
    };

    return this;
};

/**
 * Add async test
 * @param {String} name
 * @param {Number} expect optional
 * @param {Function} fn contains the test
 * @param {Boolean} async add test as async one
 */
QUnit.api.test = function( name, expect, fn, async ) {

    if ( typeof name !== "string" ) {
        throw new Error( "Test name should be the first parameter" );
    }

    var type = typeof expect,
        env;
    if ( type === "function" ) {
        fn = expect;
        expect = undefined;
    // expect can extend module env
    } else if ( type === "object" ) {
        env = expect;
        expect = undefined;
    }

    if ( typeof fn !== "function" ) {
        throw new Error( "No test function passed" );
    }

    queue.push({
        name: name,
        module: module,
        fn: fn,
        expected: expect,
        env: env,
        done: 0,
        async: async
    });

    return this;
};

/**
 * Add async test
 * @param {String} name
 * @param {Number} expect optional
 * @param {Function} fn contains the test
 */
QUnit.api.asyncTest = function( name, expect, fn ) {
    this.test( name, expect, fn, true );
    return this;
};

/**
 * Start tests execution
 */
QUnit.api.start = function() {
    pause = false;
    testDone();
    run();
    return this;
};

/**
 * Stop tests execution
 */
QUnit.api.stop = function() {
    pause = true;
    return this;
};

/**
 * Set expected amount of assertions for current test
 * @param {Number} amount
 */
QUnit.api.expect = function( amount ) {
    test.expected = amount;
    return this;
};

/**
 * A boolean assertion. Passes if the first argument is truthy.
 * @param {Boolean} value
 * @param {String} message
 */
QUnit.api.ok = function( value, message ) {
    test.done++;
    var r = {
            message: message
        };

    try {
        assert.ok( value );
    } catch (err) {
        r.errorStack = err.stack;
    }

    log(r);

    return this;
};

/**
 * A comparison assertion, uses ==.
 * @param {Object} actual
 * @param {Object} expected
 * @param {String} message
 */
QUnit.api.equals = QUnit.api.equal = function( actual, expected, message ) {
    test.done++;

    var r = {
            message: message
        };

    try {
        assert.equal( actual, expected );
    } catch( err ) {
        r.errorStack = err.stack;
    }

    log( r );

    return this;
};

/**
 * A comparison assertion, uses ==.
 * @param {Object} actual
 * @param {Object} expected
 * @param {String} message
 */
QUnit.api.notEqual = function( actual, expected, message ) {
    test.done++;

    var r = {
            message: message
        };

    try {
        assert.notEqual( actual, expected );
    } catch( err ) {
        r.errorStack = err.stack;
    }

    log( r );

    return this;
};

/**
 * A comparison assertion, uses ===.
 * @param {Object} actual
 * @param {Object} expected
 * @param {String} message
 */
QUnit.api.strictEqual = function( actual, expected, message ) {
    test.done++;

    var r = {
            message: message
        };

    try {
        assert.strictEqual( actual, expected );
    } catch( err ) {
        r.errorStack = err.stack;
    }

    log( r );

    return this;
};

/**
 * A deep recursive comparison assertion, working on primitive types, arrays and objects.
 * @param {Object} actual
 * @param {Object} expected
 * @param {String} message
 */
QUnit.api.same = QUnit.api.deepEqual = function( actual, expected, message ) {
    test.done++;

    var r = {
            message: message
        };

    try {
        assert.deepEqual( actual, expected );
    } catch( err ) {
        r.errorStack = err.stack;
    }

    log( r );

    return this;
};

QUnit.api.raises = function( actual, message ) {
    test.done++;
    var r = {
            message: message
        };

    try {
        assert.throws( actual, message );
    } catch( err ) {
        r.errorStack = err.stack;
    }

    log( r );

    return this;
};


/**
 * Original function from QUnit
 * @param {Object} obj
 * @return {String|undefined}
 */
QUnit.objectType = function( obj ) {
    if (typeof obj === "undefined") {
        return "undefined";
    }
    // consider: typeof null === object
    if (obj === null) {
        return "null";
    }

    var type = Object.prototype.toString.call( obj )
        .match(/^\[object\s(.*)\]$/)[1] || '';

    switch (type) {
        case 'Number':
        if (isNaN(obj)) {
            return "nan";
        } else {
            return "number";
        }
        case 'String':
        case 'Boolean':
        case 'Array':
        case 'Date':
        case 'RegExp':
        case 'Function':
            return type.toLowerCase();
    }
    if (typeof obj === "object") {
        return "object";
    }
    return undefined;
}

// Test for equality any JavaScript type.
// Discussions and reference: http://philrathe.com/articles/equiv
// Test suites: http://philrathe.com/tests/equiv
// Author: Philippe Rathé <prathe@gmail.com>
QUnit.equiv = function () {

    var innerEquiv; // the real equiv function
    var callers = []; // stack to decide between skip/abort functions
    var parents = []; // stack to avoiding loops from circular referencing

    // Call the o related callback with the given arguments.
    function bindCallbacks(o, callbacks, args) {
        var prop = QUnit.objectType(o);
        if (prop) {
            if (QUnit.objectType(callbacks[prop]) === "function") {
                return callbacks[prop].apply(callbacks, args);
            } else {
                return callbacks[prop]; // or undefined
            }
        }
    }

    var callbacks = function () {

        // for string, boolean, number and null
        function useStrictEquality(b, a) {
            if (b instanceof a.constructor || a instanceof b.constructor) {
                // to catch short annotaion VS 'new' annotation of a declaration
                // e.g. var i = 1;
                // var j = new Number(1);
                return a == b;
            } else {
                return a === b;
            }
        }

        return {
            "string": useStrictEquality,
            "boolean": useStrictEquality,
            "number": useStrictEquality,
            "null": useStrictEquality,
            "undefined": useStrictEquality,

            "nan": function (b) {
                return isNaN(b);
            },

            "date": function (b, a) {
                return QUnit.objectType(b) === "date" && a.valueOf() === b.valueOf();
            },

            "regexp": function (b, a) {
                return QUnit.objectType(b) === "regexp" &&
                    a.source === b.source && // the regex itself
                    a.global === b.global && // and its modifers (gmi) ...
                    a.ignoreCase === b.ignoreCase &&
                    a.multiline === b.multiline;
            },

            // - skip when the property is a method of an instance (OOP)
            // - abort otherwise,
            // initial === would have catch identical references anyway
            "function": function () {
                var caller = callers[callers.length - 1];
                return caller !== Object &&
                        typeof caller !== "undefined";
            },

            "array": function (b, a) {
                var i, j, loop;
                var len;

                // b could be an object literal here
                if ( ! (QUnit.objectType(b) === "array")) {
                    return false;
                }

                len = a.length;
                if (len !== b.length) { // safe and faster
                    return false;
                }

                //track reference to avoid circular references
                parents.push(a);
                for (i = 0; i < len; i++) {
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i]){
                            loop = true;//dont rewalk array
                        }
                    }
                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        parents.pop();
                        return false;
                    }
                }
                parents.pop();
                return true;
            },

            "object": function (b, a) {
                var i, j, loop;
                var eq = true; // unless we can proove it
                var aProperties = [], bProperties = []; // collection of strings

                // comparing constructors is more strict than using instanceof
                if ( a.constructor !== b.constructor) {
                    return false;
                }

                // stack constructor before traversing properties
                callers.push(a.constructor);
                //track reference to avoid circular references
                parents.push(a);

                for (i in a) { // be strict: don't ensures hasOwnProperty and go deep
                    loop = false;
                    for(j=0;j<parents.length;j++){
                        if(parents[j] === a[i])
                            loop = true; //don't go down the same path twice
                    }
                    aProperties.push(i); // collect a's properties

                    if (!loop && ! innerEquiv(a[i], b[i])) {
                        eq = false;
                        break;
                    }
                }

                callers.pop(); // unstack, we are done
                parents.pop();

                for (i in b) {
                    bProperties.push(i); // collect b's properties
                }

                // Ensures identical properties name
                return eq && innerEquiv(aProperties.sort(), bProperties.sort());
            }
        };
    }();

    innerEquiv = function () { // can take multiple arguments
        var args = Array.prototype.slice.apply(arguments);
        if (args.length < 2) {
            return true; // end transition
        }

        return (function (a, b) {
            if (a === b) {
                return true; // catch the most you can
            } else if (a === null || b === null || typeof a === "undefined" || typeof b === "undefined" || QUnit.objectType(a) !== QUnit.objectType(b)) {
                return false; // don't lose time with error prone cases
            } else {
                return bindCallbacks(a, callbacks, [b, a]);
            }

        // apply transition with (1..n) arguments
        })(args[0], args[1]) && arguments.callee.apply(this, args.splice(1, args.length -1));
    };

    return innerEquiv;

}();


// copy api to QUnit namespace
$.extend( QUnit, QUnit.api );

// make qunit api global
$.extend( global, QUnit.api );

// provide QUnit global namespace
global.QUnit = QUnit;