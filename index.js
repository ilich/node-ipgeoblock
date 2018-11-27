"use strict";

var fs = require("fs");
var requestIp = require("request-ip");
var MMDBReader = require("mmdb-reader");

module.exports = function (options, accessDenied) {
	
	accessDenied = accessDenied || function (req, res) {
		res.statusCode = 403;
		res.end("Forbidden");
	};
	
	options = options || {};
	verifyOptions(options);
	
	var mmdb = new MMDBReader(options.geolite2);
	
	function verifyOptions() {
		if (!options.geolite2) {
			throw new Error("options.geolite2 is not set");
		}
		
		// Check that geolite2 exists (fs.exists is deprecated)
		var geo2 = fs.openSync(options.geolite2, "r");
		fs.closeSync(geo2);
		
		options.blocked = options.blocked || [];
		options.blockedCountries = options.blockedCountries || [];
		options.allowedCountries = options.allowedCountries || [];
		
		if (options.blockedCountries.length > 0 && options.allowedCountries.length > 0) {
			throw new Error("You have to choose only allowed contries or only blocked countries");
		}
	}
	
	function getIP(req) {
		var ip = requestIp.getClientIp(req);
		if (ip !== null) {
			ip = ip.split(":");
			ip = ip[ip.length - 1];
		}
		
		return ip;
	}
	
	function isBlocked(ip, req, res) {
		req.location = req.location || {};
		req.location.country = {
			data: null,
			isoCode: ""
		};
		
		// 1. Check that IP address is blocked
		if (options.blocked.indexOf(ip) > -1) {
			return true;
		}
		
		var blocked = false;
		var query = mmdb.lookup(ip);
		if (options.blockedCountries.length > 0) {
			
			// 2. If user added country to Blocked Countries collection then only those countries 
            // are blocked 
				
			blocked = query !== null && options.blockedCountries.indexOf(query.country.iso_code) > -1;	
		} else if (options.allowedCountries.length > 0) {
			
			// 3. If user added country to Allowed Countries collecction then all countries except allowed
            // are blocked
				
			blocked = query === null || options.allowedCountries.indexOf(query.country.iso_code) === -1;
		}
		
		if (!blocked && query !== null) {
			req.location.country.data = query;
			req.location.country.isoCode = query.country.iso_code;	
		}
		
		return blocked;
	}
	
	return function (req, res, next) {
		var ip = getIP(req);
		if (isBlocked(ip, req, res)) {
			accessDenied(req, res);
			return;	
		}
		
		next();
	};
	
};
