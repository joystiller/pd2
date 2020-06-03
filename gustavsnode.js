// Using express: http://expressjs.com/
var express = require('express');
var cors = require('cors')
// Create the app
var app = express();

var cors = require('cors');
var app = express();


// Gustavs Pd-fetch
const fetch = require("node-fetch");

var ip = '192.168.1.219';
var port = '3000';

var x = 0;

// Enable CORS
app.use(function( req, res, next ) {
res.header("Access-Control-Allow-Origin", req.headers.origin);
res.header("Access-Control-Allow-Headers", "x-requested-with, content-type");
res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
res.header("Access-Control-Allow-Credentials", "true");
res.header("Access-Control-Max-Age", "1000000000");
// intercept OPTIONS method 
if ('OPTIONS' == req.method) { res.send(200); } else { next(); } });

// Set up the server
var server = app.listen(process.env.PORT || 3000, listen);



// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}


app.use(express.static('public'));


console.log("Server up and running!");

var socket = require('socket.io');

var io = socket(server);



// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', newConnection);

// We are given a websocket object in our function
function newConnection(socket) {
	console.log('We have a new client: ' + socket.id);
	socket.on('Slider', sliderData);

    // When this user emits, client side: socket.emit('otherevent',some data);
	function sliderData(data){ 
		//socket.broadcast.emit('mouse', data);
		//socket.broadcast.emit('mouse', data);
		console.log(data);

		x = data.x;	
		
		//fetch("http://192.168.1.219:3558", {
		fetch("http://" + ip + ":" + 3558, {
			method: "PUT", 
			body: ";slider1 " + x + ";"
		});	
	}

	socket.on('stockholm', stockholmWeather);

	function stockholmWeather(data){
		//socket.broadcast.emit('Stockholm', data);
		console.log(data);

		temp = data.temp;
		currentWeather = 'symbol ' + data.currentWeather;

		fetch("http://" + ip + ":" + 3558, {
			method: "PUT", 
			body: ";temp " + temp + "; weather " + currentWeather + ";"
		});
	}

	socket.on('checkboxToggle', mute);

	function mute(data) {
		console.log('return checkbox data: ' + data);

		fetch("http://" + ip + ":" + 3558, {
			method: "PUT", 
			//body: ";toggle " + 'symbol ' + data + ";"
			body: ";toggle " + data + ";"
		});	
	}
}












