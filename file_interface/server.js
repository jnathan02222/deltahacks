const express = require('express');
const next = require('next');
var { createServer } = require('http');
const multer = require('multer');
const upload = multer({ dest: 'notes/' });

const {WebSocketServer} = require('ws');

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();


app.prepare().then(
    ()=>{
        server.post('/notes', upload.single('note'), (req, res) => {
            
            res.redirect('/');
        });

        server.all('*', (req, res) => {
            return handle(req, res);
        });
        
        server.listen(3000, () => {
            console.log(`> Ready on http://localhost:${3000}`);
        });
    }
)


const wsServer = createServer();
const wss = new WebSocketServer({ server: wsServer });
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        console.log(data.toString())
        ws.send("right")
    });
});
wsServer.listen(8081, () => {
    console.log("Listening on 8081")
});