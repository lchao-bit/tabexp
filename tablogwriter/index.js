console.log("hello fennec!!")
console.error("error fennecsssssss!")

var self = require("sdk/self");
var prefsvc = require("sdk/preferences/service");
var { MatchPattern } = require("sdk/util/match-pattern");
var Request = require("sdk/request").Request;
const file = require('sdk/io/file');
var base64 = require("sdk/base64");
var cached = new Set();
var fileIO = require("sdk/io/file");
var dtnip = "";
let {Cc, Ci, CC, Cu} = require('chrome');

function HttpObserver() {}

HttpObserver.prototype.observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
var cacheService = Cc["@mozilla.org/netwerk/cache-storage-service;1"].getService(Ci.nsICacheStorageService);
var BinaryInputStream = CC('@mozilla.org/binaryinputstream;1', 'nsIBinaryInputStream', 'setInputStream');
var BinaryOutputStream = CC('@mozilla.org/binaryoutputstream;1', 'nsIBinaryOutputStream', 'setOutputStream');
var StorageStream = CC('@mozilla.org/storagestream;1', 'nsIStorageStream', 'init');
let {LoadContextInfo} = Cu.import(
"resource://gre/modules/LoadContextInfo.jsm", {}
);
var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var { setInterval } = require("sdk/timers");

var filename = "/mnt/sdcard/monitorhttp.txt"
var TextWriter = null;


/** Initialisation and termination functions */
HttpObserver.prototype.start = function() {
	this.observerService.addObserver(this, "http-on-modify-request", false);
	this.observerService.addObserver(this, "http-on-examine-response", false);
	console.log("service started!!!")        
    TextWriter = fileIO.open(filename, "w");
};



/** Stop listening, ignore errors */
HttpObserver.prototype.stop = function() {
	try {
		this.observerService.removeObserver(this, "http-on-examine-response");
		this.observerService.removeObserver(this, "http-on-modify-request");
		TextReader.close();
	} catch (e) {
		console.log("Failed to remove observer", e);
	}
};


HttpObserver.prototype.observe = function(subject, topic, data) {
	// HTTP Channel
	var chan = subject.QueryInterface(Ci.nsIHttpChannel);
	var imagepattern = new RegExp(".*/geoserver/i/([\\d]+)/([\\d]+)/([\\d]+)$");
	var vectorpattern = new RegExp(".*/geoserver/v/([\\d]+)/([\\d]+)/([\\d]+)$");
	var trafficpattern = new RegExp(".*/geoserver/t/([\\d]+)/([\\d]+)/([\\d]+)$");
	var compresspattern = new RegExp(".*/geoserver/z/([\\d]+)/([\\d]+)/([\\d]+)$");
	var serverhp = "166.111.68.197:11193";
	var uri = subject.URI.asciiSpec;
	
	switch (topic) {
		case 'http-on-modify-request':
			
			if(imagepattern.test(uri) || vectorpattern.test(uri) || trafficpattern.test(uri) || compresspattern.test(uri))			
			{
				var timestamp = Date.now();
				var method = subject.requestMethod;
				TextWriter.write(uri);
				TextWriter.write(' ');
				TextWriter.flush();
				TextWriter.write(method);
				TextWriter.write(' ');
				TextWriter.flush();
				TextWriter.write(timestamp);
				TextWriter.write('\n');
				TextWriter.flush();
			}
			break;
		case 'http-on-examine-response':
		
			if(imagepattern.test(uri) || vectorpattern.test(uri) || trafficpattern.test(uri) || compresspattern.test(uri))
			{
				var length = subject.getResponseHeader("Content-Length");
				var timestamp = Date.now();
				TextWriter.write(uri);
				TextWriter.write(' ');
				TextWriter.flush();
				TextWriter.write("Response");
				TextWriter.write(' ');
				TextWriter.flush();
				TextWriter.write(timestamp);
				TextWriter.write(' ');
				TextWriter.flush();
				TextWriter.write(length);
				TextWriter.write('\n');
				TextWriter.flush();
			}
			break;
		default:
			break;
	}
};



HttpObserver.prototype.QueryInterface = function(iid) {
	if (!iid.equals(Components.interfaces.nsISupports) &&
		!iid.equals(Components.interfaces.nsIHttpNotify) &&
		!iid.equals(Components.interfaces.nsIObserver)) {
		throw Components.results.NS_ERROR_NO_INTERFACE;
	}
	return this;
};

var httpobserver = new HttpObserver();
httpobserver.start();
// a dummy function, to show how tests work.
// to see how to test this function, look at test/test-index.js
//function dummy(text, callback) {
//  callback(text);
//}

//exports.dummy = dummy;
