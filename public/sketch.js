  // ITP Networked Media, Fall 2014
  // https://github.com/shiffman/itp-networked-media
  // Daniel Shiffman

  var socket;
  var weather;
  var api;
  var cityID;
  var key;
  let valMX;
  var toggle;
  var musictoggle;

  // this is the raspberry pi's IP: 
  //const url = '192.168.1.219';
  const url = '0.0.0.0';

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
  var t;

  function setup() {
    createCanvas(471, 887);
    socket = io.connect(url + ':3000');
    socket2 = io.connect(url + ':3001');

    const api_url = 'https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/18.102919/lat/59.336600/data.json';

    socket.on('osc', (data) => {
      console.log("data is: " + data);
      console.log(data.value);

      // this is the hum-grund-noise gate
      if (data.value == "close") {
        document.getElementById("musictoggle").checked = false;
        document.getElementById('hint').innerHTML = 'Hint: stoppa i sladden i din telefon eller dator';
        var counter = 0;
        var i = setInterval(function () {
          if (counter == 5) {
            clearInterval(i);
            document.getElementById('hint').innerHTML = '';
          }
          console.log("counting variable i... " + counter);
          counter++;
        }, 1000)
      }
    });

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

    // function updateWsymb2(data) {
    //   console.log('printing from updateWsymb2' + data);
    // }

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

    async function getISS() {
      console.log('printing from getISS');
      const response = await fetch(api_url);
      const data = await response.json();

      for (i = 0; i < data.timeSeries[timeIndex].parameters.length; i++) {
        if (data.timeSeries[timeIndex].parameters[i].name == "t") {
          console.log("i = " + i);
          console.log("current temperature is: " + data.timeSeries[timeIndex].parameters[i].values);
          t = data.timeSeries[timeIndex].parameters[i].values;
          document.getElementById('celcius').innerHTML = t;
          break;
        }
      }

      Wsymb2 = data.timeSeries[timeIndex].parameters[18].values;
      console.log('Updating weather symbol to: ' + Wsymb2);
      if (Wsymb2 == 1) {
        document.getElementById('Wsymb2').innerHTML = 'Klar himmel';
      } else if (Wsymb2 == 2) {
        document.getElementById('Wsymb2').innerHTML = 'Nästan klar himmel';
      } else if (Wsymb2 == 3) {
        document.getElementById('Wsymb2').innerHTML = 'Varierande molnighet';
      } else if (Wsymb2 == 4) {
        document.getElementById('Wsymb2').innerHTML = 'Halvklar himmel';
      } else if (Wsymb2 == 5) {
        document.getElementById('Wsymb2').innerHTML = 'Molnig himmel';
      } else if (Wsymb2 == 6) {
        document.getElementById('Wsymb2').innerHTML = 'Mulet';
      } else if (Wsymb2 == 7) {
        document.getElementById('Wsymb2').innerHTML = 'Dimma';
      } else if (Wsymb2 == 8) {
        document.getElementById('Wsymb2').innerHTML = 'Lätta regnskurar';
      } else if (Wsymb2 == 9) {
        document.getElementById('Wsymb2').innerHTML = 'Måttliga regnskurar';
      } else if (Wsymb2 == 10) {
        document.getElementById('Wsymb2').innerHTML = 'Kraftiga regnskurar';
      } else if (Wsymb2 == 11) {
        document.getElementById('Wsymb2').innerHTML = 'Åska';
      } else if (Wsymb2 == 12) {
        document.getElementById('Wsymb2').innerHTML = 'Lätta snöblandade skurar';
      } else if (Wsymb2 == 13) {
        document.getElementById('Wsymb2').innerHTML = 'Måttliga snöblandade skurar';
      } else if (Wsymb2 == 14) {
        document.getElementById('Wsymb2').innerHTML = 'Kraftiga snöblandade skurar';
      } else if (Wsymb2 == 15) {
        document.getElementById('Wsymb2').innerHTML = 'Lätta snöbyar';
      } else if (Wsymb2 == 16) {
        document.getElementById('Wsymb2').innerHTML = 'Måttliga snöbyar';
      } else if (Wsymb2 == 17) {
        document.getElementById('Wsymb2').innerHTML = 'Kraftiga snöbyar';
      } else if (Wsymb2 == 18) {
        document.getElementById('Wsymb2').innerHTML = 'Lätt regn';
      } else if (Wsymb2 == 19) {
        document.getElementById('Wsymb2').innerHTML = 'Måttligt regn';
      } else if (Wsymb2 == 20) {
        document.getElementById('Wsymb2').innerHTML = 'Kraftigt regn';
      } else if (Wsymb2 == 21) {
        document.getElementById('Wsymb2').innerHTML = 'Åska';
      } else if (Wsymb2 == 22) {
        document.getElementById('Wsymb2').innerHTML = 'Lätt snöregn';
      } else if (Wsymb2 == 23) {
        document.getElementById('Wsymb2').innerHTML = 'Måttligt snöregn';
      } else if (Wsymb2 == 24) {
        document.getElementById('Wsymb2').innerHTML = 'Kraftigt snöregn';
      } else if (Wsymb2 == 25) {
        document.getElementById('Wsymb2').innerHTML = 'Lätt snöfall';
      } else if (Wsymb2 == 26) {
        document.getElementById('Wsymb2').innerHTML = 'Måttligt snöfall';
      } else if (Wsymb2 == 27) {
        document.getElementById('Wsymb2').innerHTML = 'Kraftigt snöfall';
      }
    }

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
    toggle = select("#toggle"); // The hashtag selects the toggle in the html file
    musictoggle = select("#musictoggle");
    toggle.changed(changeToggle);
    musictoggle.changed(changeMusicToggle);
  }

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
    if (data) {
      document.getElementById("extern").innerHTML = "Extern ljudingång På"
    } else document.getElementById("extern").innerHTML = "Extern ljudingång Av"
    socket.emit('musicboxToggle', data);
  }

  function startCountdown() {
    var counter = 0;
    var distance = 3600000;
    document.getElementById("demo").innerHTML = "Startar timer...";
    var i = setInterval(function () {
      if (toggle.checked()) {
        clearInterval(i);
      } else {

        distance = distance - 1000;
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        document.getElementById("demo").innerHTML = "Fågelljud Av. Startar igen om: " + (hours).toLocaleString('en-US', {
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
          document.getElementById("demo").innerHTML = "Fågelljud På";
          //stopCountdown();
        }
      }
    }, 1000);
  }

  function stopCountdown() {
    //console.log('pringing from stopCountdown() function')
    document.getElementById("demo").innerHTML = "Fågelljud På";
  }