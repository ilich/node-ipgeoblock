"use strict";

var ipgeoblock = require("..");
var assert = require("assert");
var connect = require("connect");
var request = require("supertest");

describe("node-ipgeoblock", function () {
	
	function createApp(isWhitelist) {
		var blacklist = isWhitelist ? [] : ["FR"];
		var whitelist = isWhitelist ? ["FR"] : [];
		
		var app = connect();
		
		app.use(ipgeoblock({
			geolite2: "./test/GeoLite2-Country.mmdb",
			blocked: ["192.168.0.1", "192.168.0.3", "192.168.0.4"],
			blockedCountries: blacklist,
			allowedCountries: whitelist
		}));
		
		app.use(function (req, res) {
			res.setHeader("x-test-country", req.location.country.isoCode);
			res.end("OK");
		});	
		
		return app;
	}
	
	var app = createApp(false);
	
	it("block specific IP address", function (done) {
		request(app).get("/")
			.set("x-client-ip", "192.168.0.1")
			.expect(403)
			.expect("Forbidden", done);
	});
	
	it("allow IP address when IP blacklist is used", function (done) {
		request(app).get("/")
			.set("x-client-ip", "192.168.0.2")
			.expect("x-test-country", "")
			.expect(200)
			.expect("OK", done);
	});
	
	it("block France IP address when only France is in blackist", function (done) {
		request(app).get("/")
			.set("x-client-ip", "213.128.63.255")
			.expect(403)
			.expect("Forbidden", done);
	});
	
	it("allow Greece IP address when ony only France is in blacklist", function (done) {
		request(app).get("/")
			.set("x-client-ip", "46.246.128.0")
			.expect("x-test-country", "GR")
			.expect(200)
			.expect("OK", done);
	});
	
	it("allow unknown IP address when ony only France is in blacklist", function (done) {
		request(app).get("/")
			.set("x-client-ip", "192.168.0.2")
			.expect("x-test-country", "")
			.expect(200)
			.expect("OK", done);
	});
	
	it("allow France IP address when only France is in whitelist", function (done) {
		var appWhitelist = createApp(true);
		
		request(appWhitelist).get("/")
			.set("x-client-ip", "213.128.63.255")
			.expect("x-test-country", "FR")
			.expect(200)
			.expect("OK", done);
	});
	
	it("block Greece IP address when ony only France is in whitelist", function (done) {
		var appWhitelist = createApp(true);
		
		request(appWhitelist).get("/")
			.set("x-client-ip", "46.246.128.0")
			.expect(403)
			.expect("Forbidden", done);
	});
	
	
	it("block unknows IP address when ony only France is in whitelist", function (done) {
		var appWhitelist = createApp(true);
		
		request(appWhitelist).get("/")
			.set("x-client-ip", "192.168.0.2")
			.expect(403)
			.expect("Forbidden", done);
	});
});