var mongodb = require("mongodb").MongoClient,
	util = require("util"),
	// maximum number of records returned
	limit = 50,
	// used to determine if the query is returning a cursor or a concrete object
	arrayRegex = /\.toArray\(\)$/,
	countRegex = /\.count\(\)$/,
	limitRegex = /\.limit\(\d*\)/,
	aggregateRegex = /\.aggregate\(.*\)/;

// # Returns Cursor 
// Returns true if the specified query will return a cursor object
function returnsCursor(query) {
	"use strict";
	if (query.match(arrayRegex) || query.match(countRegex) || query.match(aggregateRegex)) {
		return false;
	}
	return true;
}

// # Execute Query
// Executes the specified query on the specified server
// Callback takes (error, results)
// results may be a single object or array
function executeQuery(dsn, queryText, cb, opts) {
	"use strict";
	opts = opts || {};
	opts.limit = opts.limit || limit;

	// we need to convert cursor objects to arrays before returning from the eval() call
	// mongo cannot return cursor objects to regular JS	
	if (returnsCursor(queryText)) {
		// limit results before converting to array, if necessary
		// any limit() in the query should take precedence over the
		// default limit applied by venode
		if (!queryText.match(limitRegex)) {
			queryText += ".limit(" + opts.limit + ")";
		}
		queryText += ".toArray()";
	}

	mongodb.connect(dsn, function (err, db) {
		if (err) {
			console.log(err);
		} else {
			db.eval(queryText, { nolock: true }, function (err, results) {
				cb(err, results);
				// make sure to close the connection
				db.close();
			});
		}
	});
}

function prettyPrint(results, doColors) {
	"use strict";
	return util.inspect(results, doColors, null);
}

exports.executeQuery = executeQuery;
exports.prettyPrint = prettyPrint;
