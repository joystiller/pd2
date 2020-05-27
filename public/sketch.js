  
// ITP Networked Media, Fall 2014
// https://github.com/shiffman/itp-networked-media
// Daniel Shiffman

// Keep track of our socket connection
var socket;


var data;
var weather;
var api;
var cityID;
var key;
var sliderFX;
var sliderMX;
let valFX;
let valMX;
var toggle;
var txt;

//Kan man fetcha 'url' på något sätt så att den inte behöver hårdkodas? 
const url = '192.168.1.13';



function setup() {
  createCanvas(400, 400);
  //noCanvas();
  background(100);

  api = "https://api.openweathermap.org/data/2.5/forecast?id=";
  cityID = 2673722;
  APIkey = "&units=metric&APPID=76754a491ae0cc7508163183ec8cd32a";

  refresh();
  setInterval(refresh, 600000);
  // Finns det bättre sätt att kalla på updateweather än med setTimeout?
  setTimeout(updateweather, 1000);
  angleMode(DEGREES);
  let d = createDiv();
  //d.style('transform: rotate(' + 90 + 'deg);');


  // The hashtag selects the toggle in the html file
  toggle = select("#toggle");
  txt = createP(toggle.checked());
  toggle.changed(changeToggle);




  sliderFX = createSlider();
  sliderMX = createSlider();
  //sliderFX.position(100,100);
  sliderFX.input(updateslider);
  sliderMX.input(updateslider);
  d.child(sliderFX);
  d.child(sliderMX);
  sliderFX.style("align-self", "right");
  //button.style("position", "center");

  
  // Start a socket connection to the server

  socket = io.connect('192.168.1.13:3000');
  
}

function gotData(data) {
  weather = data;
}

function refresh() {
  cleartext();
  var url = api + cityID + APIkey;
  loadJSON(url, gotData);
  updateweather();
}

function updateweather() {
  if (weather) {
    console.log('Temperature Stockholm: ' + weather.list[0].main.temp);
    console.log('Weather: ' + weather.list[0].weather[0].main);

    var data = {
      temp: weather.list[0].main.temp,
      currentWeather: weather.list[0].weather[0].main
    };

    console.log(data);
    socket.emit('stockholm', data); 
  }  
}


function cleartext() {
  //Write something that clear all text before printing new
}

function draw() {
  if (weather) {
    textSize(24);
    text('Temperature Stockholm: ' + weather.list[0].main.temp + ' C', 10, 50);
    text('Weather: ' + weather.list[0].weather[0].main, 10, 100);
  }
}

function updateslider() {
  // How do I not both sliders? How to use .this() function? 
  sendslider(sliderFX.value(), sliderMX.value());
}

//function updateMX() {
  //console.log(sliderMX.value());
//}


function sendslider(fxval, mxval) {
  console.log("sendslider: " + fxval +" " + mxval);

    // Make a little object with fxval and mxval
    var data = {
      x: fxval,
      y: mxval
    };

  // Send that object to the socket
  socket.emit('mouse',data);

}

function changeToggle() {
  txt.html(toggle.checked());
  var data = toggle.checked();
  socket.emit('checkboxToggle', data);
}

// Function for sending to the socket


//function sendmouse(xpos, ypos) {
  // We are sending!
//  console.log("sendmouse: " + xpos + " " + ypos);
  
  // Make a little object with  and y
//  var data = {
//    x: xpos,
//    y: ypos
//  };

  // Send that object to the socket
//  socket.emit('mouse',data);
//}
