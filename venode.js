#!/usr/bin/env node

/*global process, console */
var venode = require("./venode-lib.js"),
	program = require("commander");

program
	.version("0.0.1")
	.option("-d, --dsn [dsn]", "The DSN of the Mongo database, e.g., mongodb://localhost/test")
	.option("-q, --query [query]", "The query text to execute on the server")
	.option("-l, --limit [limit]", "The maximum number of records returned; default is 50")
	.option("--pretty", "Formats the text in the style of console.log()")
	.option("--colors", "Adds color output when using --pretty")
	.parse(process.argv);

// check for required params
if (!program.dsn || !program.query) {
	// print help and return
	program.help();
}

// the magic happens here
venode.executeQuery(program.dsn, program.query, function (err, results) {
	"use strict";
	if (err) {
		// unable to connect
		console.log("error connecting to mongo: " + err);
		process.exit();
	} else {
		// optionally format and colorize if flag is set
		results = program.pretty ? venode.prettyPrint(results, program.colors) : JSON.stringify(results);
		process.stdout.write(results);
		process.exit();
	}
}, { limit: program.limit });

