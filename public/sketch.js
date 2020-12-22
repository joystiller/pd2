  // ITP Networked Media, Fall 2014
  // https://github.com/shiffman/itp-networked-media
  // Daniel Shiffman

  var socket;
  var weather;
  var api;
  var cityID;
  var key;
  // var sliderFX;
  // var sliderMX;
  let valMX;
  var toggle;
  var musictoggle;
  const url = '192.168.1.219';
  var Wsymb2;
  var pcat;
  var startupSunrise;
  var dtRise = new Date();
  var dtSet = new Date();
  var sunStatus;
  var timeIndex = 0;
  var img;
  let imgMap;
  let c;
  let z;
  var isRaining;



  function setup() {
    //noCanvas();
    createCanvas(471, 887);
    //background(220);

    console.log('printing from setup');


    //   oscWebSocket = new osc.WebSocketPort({
    //     url: "172.20.10.2:12345",
    //     metadata: true
    //   });
    //   oscWebSocket.on("ready", onSocketOpen);
    //   oscWebSocket.on("message", onSocketMessage);
    // }

    // function onSendClick() {
    //   const msg = input.value();
    //   input.value('');
    //   // send the OSC message to server. 
    //   //(osc.js will convert it to binary packet)
    //   oscWebSocket.send({
    //     address: "/p5js/sayhi",
    //     args: [{
    //       type: "s",
    //       value: msg
    //     }]
    //   });
    // }

    // Start a socket connection to the server
    socket = io.connect(url + ':3000');
    socket2 = io.connect(url + ':3001');


    const api_url = 'https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/18.102919/lat/59.336600/data.json';
    const sun_url = 'https://api.sunrise-sunset.org/json?lat=59.336600&lng=18.102919'
    const api_radar = 'https://opendata-download-radar.smhi.se/api/version/latest/area/sweden/product/comp'



    // async function getSun() {

    //   const response = await fetch(sun_url);
    //   var hms = await response.json();

    //   // Calculations for sunrise
    //   var a = hms.results.sunrise.split(':');
    //   var b = a[2].split(' ');

    //   var hoursRise = parseInt(a[0]) + 1;
    //   var minutesRise = parseInt(a[1]);
    //   var secondsRise = parseInt(b[0]);

    //   if (b[1] == 'PM') {
    //     hoursRise = hoursRise + 12;
    //   } else if (b[1] == 'AM') {}

    //   dtRise.setHours(hoursRise);
    //   dtRise.setMinutes(minutesRise);
    //   dtRise.setSeconds(secondsRise);

    //   console.log('Sun rises at: ' + dtRise);

    //   var dt2 = new Date();
    //   if (dtRise > dt2.getTime()) {
    //     console.log('dtRise is bigger than current time, which means that the sun has not risen yet');
    //     sunStatus = true;
    //     //console.log('variable x: ' + x)
    //     //socket.emit('sunSocket', x);
    //   } else {
    //     console.log('dtRise is not bigger than current time, which means that the program was started after sunrine');
    //     sunStatus = false;
    //     //console.log('variable x: ' + x)
    //     //socket.emit('sunSocket', x);
    //   }

    //   // Calculations for sunset
    //   var c = hms.results.sunset.split(':');
    //   var d = c[2].split(' ');

    //   var hoursSet = parseInt(c[0]) + 1;
    //   var minutesSet = parseInt(c[1]);
    //   var secondsSet = parseInt(d[0]);

    //   if (d[1] == 'PM') {
    //     hoursSet = hoursSet + 12;
    //   } else if (d[1] == 'AM') {
    //     // Do nothing
    //   }

    //   dtSet.setHours(hoursSet);
    //   dtSet.setMinutes(minutesSet - 24);
    //   // The -24 is 24 minutes from Pd's 2 minutes per fader movement * 12 faders. 
    //   // Because of this, The fade will be completed by the time the sun has set.
    //   dtSet.setSeconds(secondsSet);
    //   console.log('Sun sets at: ' + dtSet);

    //   var hoursSet = dtSet.getHours();
    //   var minutesSet = dtSet.getMinutes();

    //   var sunData = {
    //     hoursRise: hoursRise,
    //     minutesRise: minutesRise,
    //     hoursSet: hoursSet,
    //     minutesSet: minutesSet,
    //     sunStatus: sunStatus
    //   };
    //   socket.emit('sunToPd', sunData);
    // }

    // async function updatePcat() {
    //   const response = await fetch(api_url);
    //   const data = await response.json();
    //   pcat = data.timeSeries[2].parameters[2].level;
    //   console.log('approved time: ' + data.approvedTime);
    //   console.log('referenceTime: ' + data.referenceTime);
    //   console.log('geometry' + data.geometry.coordinates);
    //   console.log('pcat again....: ' + data.timeSeries[0].parameters[2].level);
    //   // If there's rain on startup, send rain on. Otherwise, do nothing.
    //   if (pcat != 0) {
    //     var smhiData = {
    //       pcat: data.timeSeries[2].parameters[2].level,
    //     }
    //     socket.emit('smhiToPd', smhiData);
    //     console.log('emitting to gustavsnode, pcat not equal to 0');
    //   }
    //   console.log('printing from updatePcat, pcat = ' + data.timeSeries[2].parameters[2].level)
    // }

    // socket.on('updateWsymb2', data);

    socket.on('getISS', (counter) => {
      console.log(`hello - ${counter}`);
      getISS();
    });

    socket.on('getRadar', (data) => {
      console.log('calling getRadar from node - ' + data);
      getRadar();
    });

    // Purpose of this is to send Z if it's raining on startup, otherwise 
    // z value will be sent to node only if z value changes. 
    socket.on('getZ', (data) => {
      console.log('printing from getZ');
      if (z != null) {
        socket.emit('rainfall', z);
      }
    });

    // var counter;
    // socket.on('hello', (counter));

    // function hello(counter) {
    //   console.log(counter);
    //   getISS();
    // }

    // var data;
    // socket.on('getISS2', data);

    // function getISS2(data) {
    //   console.log(data);
    // }


    function updateWsymb2(data) {
      console.log('printing from updateWsymb2' + data);
    }

    async function getRadar() {
      console.log('z is equal to: ' + z);
      let url;
      url = 'https://opendata-download-radar.smhi.se/api/version/latest/area/sweden/product/comp/latest.png'

      loadImage('basemap.png', successMapLoad, failureMapLoad);

      function successMapLoad(data) {
        imgMap = data;
        clear();
        image(imgMap, 0, 0);
        loadImage(url, successRadarLoad, failureRadarLoad);
      }

      function successRadarLoad(data) {
        img = data; // load the image to a global variable
        image(img, 0, 0); // this loads the radar-image to the canvas
        c = data.get(273, 590); // Approximate pixel-coordinate for Stockholm
        //c = data.get(mouseX, mouseY); // Keep variable for testing. 
        console.log('Colourcode is: ' + c);

        var rgbArray = [{
          r: "0",
          g: "50",
          b: "255",
          z: "5",
        }, {
          r: "0",
          g: "70",
          b: "255",
          z: "6",
        }, {
          r: "0",
          g: "90",
          b: "255",
          z: "7",
        }, {
          r: "0",
          g: "110",
          b: "255",
          z: "8",
        }, {
          r: "0",
          g: "130",
          b: "255",
          z: "9",
        }, {
          r: "0",
          g: "150",
          b: "255",
          z: "10",
        }, {
          r: "0",
          g: "170",
          b: "255",
          z: "11",
        }, {
          r: "0",
          g: "128",
          b: "0",
          z: "12",
        }, {
          r: "0",
          g: "138",
          b: "0",
          z: "13",
        }, {
          r: "0",
          g: "148",
          b: "0",
          z: "14",
        }, {
          r: "0",
          g: "158",
          b: "0",
          z: "15",
        }, {
          r: "0",
          g: "163",
          b: "0",
          z: "16",
        }, {
          r: "0",
          g: "168",
          b: "0",
          z: "17",
        }, {
          r: "0",
          g: "173",
          b: "0",
          z: "18",
        }, {
          r: "0",
          g: "178",
          b: "0",
          z: "19",
        }, {
          r: "10",
          g: "208",
          b: "10",
          z: "20",
        }, {
          r: "10",
          g: "218",
          b: "10",
          z: "21",
        }, {
          r: "10",
          g: "228",
          b: "10",
          z: "22",
        }, {
          r: "10",
          g: "238",
          b: "10",
          z: "23",
        }, {
          r: "10",
          g: "248",
          b: "10",
          z: "24",
        }, {
          r: "255",
          g: "255",
          b: "15",
          z: "25",
        }, {
          r: "255",
          g: "246",
          b: "15",
          z: "26",
        }, {
          r: "255",
          g: "238",
          b: "15",
          z: "27",
        }, {
          r: "255",
          g: "229",
          b: "15",
          z: "28",
        }, {
          r: "255",
          g: "220",
          b: "15",
          z: "29",
        }, {
          r: "255",
          g: "200",
          b: "0",
          z: "30",
        }, {
          r: "255",
          g: "180",
          b: "0",
          z: "31",
        }, {
          r: "255",
          g: "160",
          b: "0",
          z: "32",
        }, {
          r: "255",
          g: "140",
          b: "0",
          z: "33",
        }, {
          r: "255",
          g: "120",
          b: "0",
          z: "34",
        }, {
          r: "255",
          g: "35",
          b: "35",
          z: "35",
        }, {
          r: "255",
          g: "15",
          b: "15",
          z: "36",
        }, {
          r: "255",
          g: "0",
          b: "0",
          z: "37",
        }, {
          r: "235",
          g: "0",
          b: "0",
          z: "38",
        }, {
          r: "215",
          g: "0",
          b: "0",
          z: "39",
        }, {
          r: "195",
          g: "0",
          b: "0",
          z: "40",
        }, {
          r: "175",
          g: "0",
          b: "0",
          z: "41",
        }, {
          r: "155",
          g: "0",
          b: "0",
          z: "42",
        }, {
          r: "135",
          g: "0",
          b: "0",
          z: "43",
        }, {
          r: "115",
          g: "0",
          b: "0",
          z: "44",
        }, {
          r: "175",
          g: "0",
          b: "175",
          z: "45",
        }, {
          r: "184",
          g: "0",
          b: "184",
          z: "46",
        }, {
          r: "193",
          g: "0",
          b: "193",
          z: "47",
        }, {
          r: "202",
          g: "0",
          b: "202",
          z: "48",
        }, {
          r: "211",
          g: "0",
          b: "211",
          z: "49",
        }, {
          r: "219",
          g: "0",
          b: "219",
          z: "50",
        }, {
          r: "228",
          g: "0",
          b: "228",
          z: "51",
        }, {
          r: "237",
          g: "0",
          b: "237",
          z: "52",
        }, {
          r: "246",
          g: "0",
          b: "246",
          z: "53",
        }, {
          r: "255",
          g: "0",
          b: "255",
          z: "54",
        }, {
          r: "0",
          g: "255",
          b: "255",
          z: "55",
        }, {
          r: "13",
          g: "255",
          b: "255",
          z: "56",
        }, {
          r: "26",
          g: "255",
          b: "255",
          z: "57",
        }, {
          r: "39",
          g: "255",
          b: "255",
          z: "58",
        }, {
          r: "51",
          g: "255",
          b: "255",
          z: "59",
        }, {
          r: "64",
          g: "255",
          b: "255",
          z: "60",
        }, {
          r: "77",
          g: "255",
          b: "255",
          z: "61",
        }, {
          r: "90",
          g: "255",
          b: "255",
          z: "62",
        }, {
          r: "102",
          g: "255",
          b: "255",
          z: "63",
        }, {
          r: "115",
          g: "255",
          b: "255",
          z: "64",
        }, {
          r: "128",
          g: "255",
          b: "255",
          z: "65",
        }, {
          r: "141",
          g: "255",
          b: "255",
          z: "66",
        }, {
          r: "154",
          g: "255",
          b: "255",
          z: "67",
        }, {
          r: "166",
          g: "255",
          b: "255",
          z: "68",
        }, {
          r: "179",
          g: "255",
          b: "255",
          z: "69",
        }, {
          r: "192",
          g: "255",
          b: "255",
          z: "70",
        }]

        for (i = 0; i < rgbArray.length; i++) {
          if (rgbArray[i].r == c[0] & rgbArray[i].g == c[1] & rgbArray[i].b == c[2]) {
            isRaining = true;
            if (z != rgbArray[i].z) { // Overwrite previous Z and sends it to socket.
              console.log('Z value changed, isRaining set to true, emitting data to node');
              z = rgbArray[i].z;
              socket.emit('rainfall', z);
            }
            break; // Found a true, breaking out of the loop
          } else {
            // is not raining
            isRaining = false;
          }
        }

        if (isRaining) {

        } else {
          if (z != 0) {
            console.log('just stopped raining!');
            z = 0;
            socket.emit('rainfall', z);
          }
        }
      }

      function failureRadarLoad() {
        console.log('Failed to load map image');
      }

      function failureMapLoad() {
        console.log('Failed to load radar image.');
      }
    }


    // setInterval(function () {
    //   getRadar();
    // }, 3000);


    async function getISS() {
      console.log('printing from getISS');

      const response = await fetch(api_url);
      const data = await response.json();

      //   console.log('Current time series is: ' + data.timeSeries[2].validTime);

      //   if (pcat != data.timeSeries[2].parameters[2].level) {
      //     var smhiData = {
      //       pcat: data.timeSeries[2].parameters[2].level,
      //     };
      //     console.log('this should only be called if there is a change in pcat');
      //     socket.emit('smhiToPd', smhiData);
      //     pcat = data.timeSeries[2].parameters[2].level;
      //   }


      //   console.log('pcat value from list: ' + data.timeSeries[2].parameters[2].level)

      //   if (data.timeSeries[2].parameters[2].level != 0) {
      //     console.log('it is raining, call the socket.emit!');
      //   }

      //   // '.' First, store pcat in a variable. Then, once every hour, call the API, 
      //   // compare the pcat value from the API with the one stored in the variable. 
      //   // If they do not equal, call the socket.emit. 

      //   //commenting out the socket.emit to Pd because I will change it to 
      //   //the radar images. 

      //   // Problem: Pd netreceive gets crammed with data. It opens up too many ports. 
      //   // --> That's why: I need to send data only when it starts raining. 
      //   // Or only send if it stops raining. 

      //   // If pcat changes value from 0 to 1-6, do socket.emit. 
      //   // Also, if it changes from values 1-6 to 0, do socket.emit. 
      //   // At server startup, it should only emit data if pcat = 1-6. 
      //   // Then, if pcat 
      //   //socket.emit('smhiToPd', smhiData);

      Wsymb2 = data.timeSeries[timeIndex].parameters[18].values;
      console.log('Updating weather symbol to: ' + Wsymb2);
      if (Wsymb2 == 1) {
        document.getElementById('Wsymb2').innerHTML = 'Clear sky';
      } else if (Wsymb2 == 2) {
        document.getElementById('Wsymb2').innerHTML = 'Nearly clear sky';
      } else if (Wsymb2 == 3) {
        document.getElementById('Wsymb2').innerHTML = 'Variable cloudiness';
      } else if (Wsymb2 == 4) {
        document.getElementById('Wsymb2').innerHTML = 'Halfclear sky';
      } else if (Wsymb2 == 5) {
        document.getElementById('Wsymb2').innerHTML = 'Cloudy sky';
      } else if (Wsymb2 == 6) {
        document.getElementById('Wsymb2').innerHTML = 'Overcast';
      } else if (Wsymb2 == 7) {
        document.getElementById('Wsymb2').innerHTML = 'Fog';
      } else if (Wsymb2 == 8) {
        document.getElementById('Wsymb2').innerHTML = 'Light rain showers';
      } else if (Wsymb2 == 9) {
        document.getElementById('Wsymb2').innerHTML = 'Moderate rain showers';
      } else if (Wsymb2 == 10) {
        document.getElementById('Wsymb2').innerHTML = 'Heavy rain showers';
      } else if (Wsymb2 == 11) {
        document.getElementById('Wsymb2').innerHTML = 'Thunderstorm';
      } else if (Wsymb2 == 12) {
        document.getElementById('Wsymb2').innerHTML = 'Light sleet showers';
      } else if (Wsymb2 == 13) {
        document.getElementById('Wsymb2').innerHTML = 'Moderate sleet showers';
      } else if (Wsymb2 == 14) {
        document.getElementById('Wsymb2').innerHTML = 'Heavy sleet showers';
      } else if (Wsymb2 == 15) {
        document.getElementById('Wsymb2').innerHTML = 'Light snow showers';
      } else if (Wsymb2 == 16) {
        document.getElementById('Wsymb2').innerHTML = 'Moderate snow showers';
      } else if (Wsymb2 == 17) {
        document.getElementById('Wsymb2').innerHTML = 'Heavy snow showers';
      } else if (Wsymb2 == 18) {
        document.getElementById('Wsymb2').innerHTML = 'Light rain';
      } else if (Wsymb2 == 19) {
        document.getElementById('Wsymb2').innerHTML = 'Moderate rain';
      } else if (Wsymb2 == 20) {
        document.getElementById('Wsymb2').innerHTML = 'Heavy rain';
      } else if (Wsymb2 == 21) {
        document.getElementById('Wsymb2').innerHTML = 'Thunder';
      } else if (Wsymb2 == 22) {
        document.getElementById('Wsymb2').innerHTML = 'Light sleet';
      } else if (Wsymb2 == 23) {
        document.getElementById('Wsymb2').innerHTML = 'Moderate sleet';
      } else if (Wsymb2 == 24) {
        document.getElementById('Wsymb2').innerHTML = 'Heavy sleet';
      } else if (Wsymb2 == 25) {
        document.getElementById('Wsymb2').innerHTML = 'Light snowfall';
      } else if (Wsymb2 == 26) {
        document.getElementById('Wsymb2').innerHTML = 'Moderate snowfall';
      } else if (Wsymb2 == 27) {
        document.getElementById('Wsymb2').innerHTML = 'Heavy snowfall';
      }

    }

    // getISS();
    // getSun();

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

    angleMode(DEGREES);
    let d = createDiv();
    d.style('transform: rotate(' + 90 + 'deg);');


    // The hashtag selects the toggle in the html file
    toggle = select("#toggle");
    musictoggle = select("#musictoggle");
    toggle.changed(changeToggle);
    musictoggle.changed(changeMusicToggle);
    // sliderMX = createSlider(0, 127, 0);
    // sliderMX.input(updateslider);

  }

  // function draw() {
  //   console.log(mouseX, mouseY);
  // }

  // function updateslider() {
  //   sendslider(sliderMX.value());
  // }

  // function sendslider(mxval) {
  //   console.log("sendslider: " + mxval);

  //   var data = {
  //     x: mxval
  //   };

  //   socket.emit('Slider', data);

  // }

  function changeToggle() {
    var data = toggle.checked();
    //console.log("calling the changeToggle function " + data);
    socket.emit('checkboxToggle', data);
    if (data) {
      return stopCountdown();
    } else startCountdown();
  }

  function changeMusicToggle() {
    var data = musictoggle.checked();
    //console.log("calling the changeMusicToggle function " + data);
    socket.emit('musicboxToggle', data);
  }

  function startCountdown() {
    var counter = 0;
    var distance = 3600000;
    document.getElementById("demo").innerHTML = "Commencing countdown...";
    var i = setInterval(function () {
      if (toggle.checked()) {
        clearInterval(i);
      } else {

        distance = distance - 1000;
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        document.getElementById("demo").innerHTML = "Muted - Fade in begins in: " + (hours).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
          }) + ":" +
          (minutes).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
          }) + ":" + (seconds).toLocaleString('en-US', {
            minimumIntegerDigits: 2,
            useGrouping: false
          });

        counter++;
        if (counter === 3600) {
          clearInterval(i);
          document.getElementById("toggle").checked = true;
          socket.emit('checkboxToggle', toggle.checked());
          console.log('this is printed from "if counter === 3600"')
          document.getElementById("demo").innerHTML = "Click toggle to mute";
          //stopCountdown();
        }
      }
    }, 1000);
  }

  function stopCountdown() {
    //console.log('pringing from stopCountdown() function')
    document.getElementById("demo").innerHTML = "Click toggle to mute";
  }