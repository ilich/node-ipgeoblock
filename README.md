node-ipgeoblock 
===============

[![Build Status](https://travis-ci.org/ilich/node-ipgeoblock.svg?branch=master)](https://travis-ci.org/ilich/node-ipgeoblock)

Node-ipgeoblock helps you secure your Express application by intoducing the blacklist of IPs, the blacklist of countries or the whitelist of countries. 

This product includes GeoLite2 data created by MaxMind, available from [http://www.maxmind.com](http://www.maxmind.com).

Installation
------------

First, run `npm install node-ipgeoblock` for your application. 

Then download the latest version of [MaxMind GeoLite2 Country Database](https://dev.maxmind.com/geoip/geoip2/geolite2/) and save it somewhere in the way that you application can access it. Make sure you download the database in MaxMind DB format. We will use *./GeoLite2-Country.mmdb* in the following examples.

The last step is to register node-ipgeoblock middleware in your Express (or Connect) application.

IPs blacklist
---------------------

```javascript
var ipgeoblock = require("node-ipgeoblock");

var app = express();

app.use(ipgeoblock({
	geolite2: "./GeoLite2-Country.mmdb",
	blocked: ["192.168.0.1", "192.168.0.3", "192.168.0.4"]
}));
```

Countries blacklist
--------------------------

```javascript
var ipgeoblock = require("node-ipgeoblock");

var app = express();

app.use(ipgeoblock({
	geolite2: "./GeoLite2-Country.mmdb",
	blockedCountries: [ "FR", "GB", "DE" ]
}));
```

When Countries Blackist is used you allow access for all IPs except IPs assigned to the countres from the blacklist. The Country Code **MUST** be upper case [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) Code.

Countries whitelist
--------------------------

```javascript
var ipgeoblock = require("node-ipgeoblock");

var app = express();

app.use(ipgeoblock({
	geolite2: "./GeoLite2-Country.mmdb",
	allowedCountries: [ "FR", "GB", "DE" ]
}));
```

When Countries Whitelist is uses you restict access to the application only for the IPs assigned to the countries in the whitelist. The Country Code **MUST** be upper case [ISO 3166-2](https://en.wikipedia.org/wiki/ISO_3166-2) Code.

Combine IPs and countries blacklists
------------------------------------------

You can specify only countries blacklist or whitelist. You cannot use both at the same time. But you can use IPs blacklist and countries blacklist or whitelist.

```javascript
var ipgeoblock = require("node-ipgeoblock");

var app = express();

app.use(ipgeoblock({
	geolite2: "./GeoLite2-Country.mmdb",
	blocked: ["192.168.0.1", "192.168.0.3", "192.168.0.4"],
	blockedCountries: [ "FR", "GB", "DE" ]
}));
```

Get country information for a request
--------------------------------------------

Node-ipgeoblock adds IP country information to the request object.

```javascript
app.use(function (req, res) {
	// MaxMind GeoLite2 country object
	console.log(JSON.stringify(req.location.country.data));
	
	// Country ISO 3166-2 code
	console.log(req.location.country.isoCode);
});
```

Custom access denied error hander
--------------------------------------------

```javascript
var ipgeoblock = require("node-ipgeoblock");

var app = express();

app.use(ipgeoblock({
	geolite2: "./GeoLite2-Country.mmdb",
	blocked: ["192.168.0.1", "192.168.0.3", "192.168.0.4"]
}, function (req, res) {
	res.statusCode = 500;
	res.end("Internal Server Error");
}));
```