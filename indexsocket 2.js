const content = require('fs').readFileSync(__dirname + '/indexsocket.html', 'utf8');

const httpServer = require('http').createServer((req, res) => {
    // serve the index.html file
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length', Buffer.byteLength(content));
    res.end(content);
});

const io = require('socket.io')(httpServer);
const fetch = require("node-fetch");

io.on('connect', socket => {
    console.log('connect');
});

httpServer.listen(3000, () => {
    console.log('go to http://localhost:3000');
});

io.on('connect', socket => {
    socket.on('hey', data => {
        console.log('hey', data);

        //HEJ :) Här är node-fetch. Denna funkade i gustavsnode.js, men inte i index.ts. 
        fetch("http://localhost" + ":" + 3558, {
            method: "PUT",
            body: ";slider1 " + data + ";"
        });
    });
});