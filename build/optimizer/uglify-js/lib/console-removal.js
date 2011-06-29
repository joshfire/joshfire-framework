var jsp = require("./parse-js"),
    pro = require("./process"),
    slice = jsp.slice,
    member = jsp.member,
    PRECEDENCE = jsp.PRECEDENCE,
    OPERATORS = jsp.OPERATORS;

function ast_console_removal(ast) {
        var w = pro.ast_walker(), walk = w.walk;
        return w.with_walkers({
                "call": function(expr, args) {
                        // replace console call by a text which will be deleted later
                        if (expr[0] == "dot" && expr[1] instanceof Array && expr[1][0] == 'name' && expr[1][1] == "console")
                                return ["atom", "__JOSHFIRE_REMOVE_ME"];
                }
        }, function() {
                return walk(ast);
        });
};

exports.ast_console_removal = ast_console_removal;
