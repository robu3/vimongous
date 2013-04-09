var mongodb = require("mongodb").MongoClient,
	util = require("util"),
	outputSize = 50,
	limiter = ".limit(" + outputSize + ").toArray()",
	// used to determine if the query is returning a cursor or a concrete object
	noLimitRegex = /\.count\(\)$/;

//# Executes the specified query on the specified server
//  Callback takes (error, results)
//  results may be a single object or array
var executeQuery = function (dsn, queryText, cb) {
	"use strict";

	if (!queryText.match(noLimitRegex)) {
		// we need to convert cursor objects to arrays before returning from the eval() call
		// mongo cannot return cursor objects to regular JS	
		queryText += limiter;
	}
	mongodb.connect(dsn, function (err, db) {
		if (err) {
			console.log(err);
		} else {
			db.eval(queryText, { nolock: true }, function (err, results) {
				cb(err, results);
			});
		}
	});
};

var prettyPrint = function (results, doColors) {
	"use strict";
	return util.inspect(results, doColors);
};

exports.executeQuery = executeQuery;
exports.prettyPrint = prettyPrint;


