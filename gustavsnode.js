var express = require('express')
const fetch = require("node-fetch");
var socket = require('socket.io');

var http = require('http');
var fs = require('fs');
var osc = require('osc-min');
var dgram = require('dgram');


// this is the raspberry pi's IP:
// var ip = '192.168.1.219';
// var ip = '0.0.0.0';

// var port = '3000';
// var port2 = '3001';

var app = express()
var dt = new Date();
dt.setHours(dt.getHours() + 2);
var timeIndex = 0;

// SMHIs api_url
const api_url = 'https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/18.102919/lat/59.336600/data.json';
const sun_url = 'https://api.sunrise-sunset.org/json?lat=59.336600&lng=18.102919'

var socket;
var pcat;
var dtRise = new Date();
var dtSet = new Date();
var sunStatus;
var pcatIndex;

// Set up the server
var server = app.listen(process.env.PORT || 3000, listen);

// This call back just tells us that the server has started
function listen() {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static(__dirname + '/public'));

console.log("Server up and running!");

// not sure if this is doing anything... For the new http update this doesn't work.
var io = socket(server, {
	handlePreflightRequest: (req, res) => {
		const headers = {
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Origin": req.headers.origin,
			"Access-Control-Allow-Credentials": true
		};
		res.writeHead(200, headers);
		res.end();
	}
});

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', newConnection);


async function getSun() {
	try {
		const response = await fetch(sun_url);
		var hms = await response.json();
		// Calculations for sunrise
		var a = hms.results.sunrise.split(':');
		var b = a[2].split(' ');
		var hoursRise = parseInt(a[0]) + 1;
		var minutesRise = parseInt(a[1]);
		var secondsRise = parseInt(b[0]);

		if (b[1] == 'PM') {
			hoursRise = hoursRise + 12;
		} else if (b[1] == 'AM') {}

		dtRise.setHours(hoursRise);
		dtRise.setMinutes(minutesRise);
		dtRise.setSeconds(secondsRise);

		console.log('Sun rises at: ' + dtRise);

		var dt2 = new Date();
		if (dtRise > dt2.getTime()) {
			console.log('dtRise is bigger than current time, which means that the sun has not risen yet');
			sunStatus = true;

		} else {
			console.log('dtRise is not bigger than current time, which means that the program was started after sunrine');
			sunStatus = false;
		}

		// Calculations for sunset
		var c = hms.results.sunset.split(':');
		var d = c[2].split(' ');

		var hoursSet = parseInt(c[0]) + 1;
		var minutesSet = parseInt(c[1]);
		var secondsSet = parseInt(d[0]);

		if (d[1] == 'PM') {
			hoursSet = hoursSet + 12;
		} else if (d[1] == 'AM') {
			// Do nothing
		}

		dtSet.setHours(hoursSet);
		dtSet.setMinutes(minutesSet - 24);
		// The -24 is 24 minutes from Pd's 2 minutes per fader movement * 12 faders. 
		// Because of this, The fade will be completed by the time the sun has set.
		dtSet.setSeconds(secondsSet);
		console.log('Sun sets at: ' + dtSet);

		var hoursSet = dtSet.getHours();
		var minutesSet = dtSet.getMinutes();

		var sunData = {
			hoursRise: hoursRise,
			minutesRise: minutesRise,
			hoursSet: hoursSet,
			minutesSet: minutesSet,
			sunStatus: sunStatus
		};
		sunData2(sunData);
	} catch (err) {
		console.log("getSun could not fetch data, check internet connection");
	}
}

async function updatePcat() {
	try {
		const response = await fetch(api_url);
		const data = await response.json();

		var i;
		for (i = 0; i < data.timeSeries[timeIndex].parameters.length; i++) {
			const param = data.timeSeries[timeIndex].parameters[i];
			if (param.name === 'pcat') {
				pcatIndex = i;
			}
		}
		// Updating pcat with the new updated pcatIndex.
		pcat = data.timeSeries[timeIndex].parameters[pcatIndex].level;

		console.log('pcat index is: ' + pcatIndex);
		console.log('pcat value is: ' + pcat);
		console.log('approved time: ' + data.approvedTime);
		console.log('referenceTime: ' + data.referenceTime);

		// If there's rain on startup, send rain on. Otherwise, do nothing.
		if (pcat != 0) {
			var smhiData = {
				pcat: data.timeSeries[timeIndex].parameters[pcatIndex].level,
			}
			smhi(smhiData);
			console.log('emitting to gustavsnode, pcat not equal to 0');
		}
	} catch (err) {
		console.log("updatePcat could not fetch api data, check internet connection");
	}
}

async function getISS() {
	try {
		const response = await fetch(api_url);
		const data = await response.json();

		var i;
		for (i = 0; i < data.timeSeries[timeIndex].parameters.length; i++) {
			const param = data.timeSeries[timeIndex].parameters[i];
			if (param.name === 'pcat') {
				pcatIndex = i;
			}
		}
		// Updating pcat with the new updated pcatIndex.
		pcat = data.timeSeries[timeIndex].parameters[pcatIndex].level;

		console.log('Current time series is: ' + data.timeSeries[timeIndex].validTime);

		console.log('pcatIndex = ' + pcatIndex);
		if (pcat != data.timeSeries[timeIndex].parameters[pcatIndex].level) {
			var smhiData = {
				pcat: data.timeSeries[timeIndex].parameters[pcatIndex].level,
			};
			console.log('this should only be called if there is a change in pcat');
			smhi(smhiData);
			pcat = data.timeSeries[timeIndex].parameters[pcatIndex].level;
		}

		if (data.timeSeries[timeIndex].parameters[pcatIndex].level != 0) {
			console.log('it is raining, call the socket.emit!');
			// Does it ever start raining? getISS() is called once every hour,
			// but this function should only be called on server startup, 
			// then if pcat changes. Need to write a new global function. 
		}

		// '.' First, store pcat in a variable. Then, once every hour, call the API, 
		// compare the pcat value from the API with the one stored in the variable. 
		// If they do not equal, call the socket.emit. 
	} catch (err) {
		console.log("getISS could not fetch data, check internet connection");
	}
}

updatePcat();
getISS();
getSun();

//At first, getISS (that is, get the weather) and getSun is called. 
//Then, getSun updates once every 24 hours. 
//getISS should update once every hour, but it should only send data to Pd
//whenever it starts or stops raining.

setInterval(function () {
	getSun();
}, 86400000);

setInterval(function () {
	getISS();
}, 3600000)


async function sunData2(data) {
	hoursRise = data.hoursRise;
	minutesRise = data.minutesRise;
	hoursSet = data.hoursSet;
	minutesSet = data.minutesSet;
	sunStatus = data.sunStatus;

	console.log('sending sundata to pd')

	var osc_msg = osc.toBuffer({
		oscType: 'message',
		address: '/sun',
		args: [{
				type: 'integer',
				value: hoursRise
			},
			{
				type: 'integer',
				value: minutesRise
			},
			{
				type: 'integer',
				value: hoursSet
			},
			{
				type: 'integer',
				value: minutesSet
			},
			{
				type: 'symbol',
				value: sunStatus
			}
		]
	});
	udp_server.send(osc_msg, 0, osc_msg.length, 9999);
}
// This is for receiving OSC from Pd. 
var udp_server = dgram.createSocket('udp4', function (msg, rinfo) {

	var osc_message;
	try {
		osc_message = osc.fromBuffer(msg);
		console.log(osc.fromBuffer(msg));
	} catch (err) {
		return console.log('Could not decode OSC message');
	}

	if (osc_message.address = '/mp3gate') {
		//var x = parseInt(osc_message.args[0].value);
		console.log("osc_messages is......" + x);
		io.emit('osc', {
			//value: parseInt(osc_message.args[0].value),
			value: osc_message.args[0].value,
		});
		return console.log('Found an mp3gate adress. Returning.');
	}

	//ParseInt converts a string to an integer. 
	//Then it looks at the message. 
	var x = parseInt(osc_message.args[0].value);
	console.log("osc_messages is......" + x);

	remote_osc_ip = rinfo.address;
	rinfo

	io.emit('osc', { // this emits the change to sketch.js 
		x: parseInt(osc_message.args[0].value) || 0,
		y: parseInt(osc_message.args[1].value) || 0
	});

});

// We are given a websocket object in our function
function newConnection(socket) {
	console.log('We have a new client: ' + socket.id);

	// These functions are called on startup, then they're called with timed events.
	socket.emit('getISS');
	socket.emit('getRadar');
	socket.emit('getZ');

	let counter = 0;
	setInterval(() => {
		socket.emit('getISS', ++counter);
	}, 3600000);

	setInterval(() => {
		socket.emit('getRadar', ++counter);
	}, 60000);

	socket.on('sunToPd', sunData2);
	socket.on('checkboxToggle', mute);
	socket.on('musicboxToggle', activateMusic);
	socket.on('rainfall', sendRainfall);

	async function sendRainfall(data) {
		if (data > 45) { // Safety measure keeping installation from playing too loud
			data = 45;
		}
		console.log('rainfall updated, z = ' + data);

		var osc_msg = osc.toBuffer({
			oscType: 'message',
			address: '/z',
			args: [{
				type: 'integer',
				value: data
			}]
		});
		udp_server.send(osc_msg, 0, osc_msg.length, 9999);
	}

	async function mute(data) {
		if (data) {
			dt2 = new Date();
			console.log('Weather installation was unmuted at ' + dt2.toLocaleDateString() + ' ' + dt2.toLocaleTimeString('en-US'));
		} else {
			dt2 = new Date();
			console.log('Weather installation was muted at ' + dt2.toLocaleDateString() + ' ' + dt2.toLocaleTimeString('en-US'));
		}

		var osc_msg = osc.toBuffer({
			oscType: 'message',
			address: '/mute',
			args: [{
				type: 'symbol',
				value: data
			}]
		});
		udp_server.send(osc_msg, 0, osc_msg.length, 9999);
	}

	async function activateMusic(data) {
		dt2 = new Date();
		console.log('Music checkbox was set to ' + data + ' at ' + dt2.toLocaleDateString() + ' ' + dt2.toLocaleTimeString('en-US'));

		var osc_msg = osc.toBuffer({
			oscType: 'message',
			address: '/musictoggle',
			args: [{
				type: 'symbol',
				value: data
			}]
		});
		udp_server.send(osc_msg, 0, osc_msg.length, 9999);
	}
}

//tydligen behöver man en bind för att annars ändras porten dynamiskt.
udp_server.bind(9998);
console.log('Starting UDP server on UDP port 9998');

// function timeout(ms, promise) {
// 	return new Promise(function (resolve, reject) {
// 		setTimeout(function () {
// 			reject(new Error("timeout"))
// 		}, ms)
// 		promise.then(resolve, reject)
// 	})
// }