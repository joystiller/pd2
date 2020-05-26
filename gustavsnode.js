// Using express: http://expressjs.com/
var express = require('express');
var socket = require('socket.io');
// Gustavs Pd-fetch
const fetch = require("node-fetch");
var ip = '192.168.9.89';
var port = '7300';

var x = 60;
var y = 100;

// Create the app
var app = express();
// Set up the server
var server = app.listen(port, + ip);

//Tell server to look in the public folder for the html file
app.use(express.static('public'));

console.log("Server up and running!");

var io = socket(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', newConnection);

// We are given a websocket object in our function
function newConnection(socket) {
	console.log('We have a new client: ' + socket.id);
	socket.on('mouse', mouseData);

    // When this user emits, client side: socket.emit('otherevent',some data);
	function mouseData(data){ 
		//socket.broadcast.emit('mouse', data);
		//socket.broadcast.emit('mouse', data);
		console.log(data);

		x = data.x;
		y = data.y;	
		
		//fetch("http://192.168.1.219:3558", {
		fetch("http://" + ip + ":" + port, {
			method: "PUT", 
			body: ";slider1 " + x + "; slider2 " + y + ";"
		});	
	}

	socket.on('stockholm', stockholmWeather);

	function stockholmWeather(data){
		//socket.broadcast.emit('Stockholm', data);
		console.log(data);

		temp = data.temp;
		currentWeather = 'symbol ' + data.currentWeather;

		fetch("http://" + ip + ":" + port, {
			method: "PUT", 
			body: ";temp " + temp + "; weather " + currentWeather + ";"
		});
	}

	socket.on('toggle', mute);

	function mute(data) {
		console.log(data);
	}
}












