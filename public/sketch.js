  
// ITP Networked Media, Fall 2014
// https://github.com/shiffman/itp-networked-media
// Daniel Shiffman

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
const url = '192.168.9.89';


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
  sliderFX.input(updateslider);
  sliderMX.input(updateslider);
  d.child(sliderFX);
  d.child(sliderMX);
  sliderFX.style("align-self", "right");
  //button.style("position", "center");

  // Start a socket connection to the server

  socket = io.connect('192.168.9.89:3000');

  var timer = createP("");
  timer.id('demo');
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

  var data = {
    x: fxval,
    y: mxval
  };

  socket.emit('mouse',data);

}

function changeToggle() {
  txt.html(toggle.checked());
  var data = toggle.checked();
  socket.emit('checkboxToggle', data);
  if (data){
    return stopCountdown();
  } else startCountdown();
}

function startCountdown() {
  var counter = 0;
  var distance = 6000;
  document.getElementById("demo").innerHTML = "00:00:06";
  var i = setInterval(function() { 
    
    distance = distance - 1000;
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("demo").innerHTML = (hours).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":"
    + (minutes).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":" + (seconds).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});

    counter++;
    if (counter === 6) {
      clearInterval(i);
      document.getElementById("demo").innerHTML = "EXPIRED";
      document.getElementById("toggle").checked = true;
      socket.emit('checkboxToggle', toggle.checked());
      console.log('toggle position: ' + toggle.checked());
    }
  }, 1000);
}

