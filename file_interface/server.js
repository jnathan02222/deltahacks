const express = require('express');
const next = require('next');
var { createServer } = require('http');
const multer = require('multer');
const upload = multer({ dest: 'notes/' });
const fs = require('fs');
const pdf = require('pdf-parse');
var { CohereClient } = require("cohere-ai");

const {WebSocketServer} = require('ws');

const dev = true;
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();


app.prepare().then(
    ()=>{
        server.use(express.json())
        server.post('/notes', upload.single('note'), (req, res) => {
            //Process file and turn into JSON using Cohere API           
            let dataBuffer = fs.readFileSync(req.file["path"]);
            pdf(dataBuffer).then(function(data) {
                const client = new CohereClient({ token: "EngU1XLXyXtDTRCYWHvpWuDJzHUyQxorejs1UgSa" });        
                client.chat(
                    {
                        message: data.text,
                        model: "command-r-08-2024",
                        preamble: "You are an LLM designed to only output and create multiple questions and answers in JSON format based on the notes provided. The questions and answers should be one sentence long. This is the requested format of the JSON:\n{\n     \"First generated question\": \"Answer to question 1\",\n     \"Second generated question\": \"Answer to question 2\",\n     \"Third generated question\": \"Answer to question 3\",\n     \"Fourth generated question\": \"Answer to question 4\",\n    ... (keep going until all topics in the notes are covered)\n}"
                    }
                ).then(
                    (response)=>{
                        fs.writeFile(`data\\${req.file["filename"]}.json`, response.text, (err) => {
                            if (err) {
                                console.error('Error writing to file:', err);
                            } else {
                                console.log('Response saved');
                            }
                        });
                        res.redirect('/');
                    }
                )
            });
        });

        server.get('/question', (req, res) => {
            var files = fs.readdirSync(`data/`)
            const randomIndex = Math.floor(Math.random() * files.length);
            
            var questions = JSON.parse(fs.readFileSync(`data/${files[randomIndex]}`))
            
            const keys = Object.keys(questions);
            const randomKey = keys[Math.floor(Math.random() * keys.length)];
            res.json({q: randomKey, a :questions[randomKey]})
        });

        server.post('/answer', (req, res) =>{
            console.log(req.body)
            console.log(JSON.stringify(req.body))
            const client = new CohereClient({ token: "EngU1XLXyXtDTRCYWHvpWuDJzHUyQxorejs1UgSa" });        
            client.chat(
                {
                    message: JSON.stringify(req.body),
                    model: "command-r-08-2024",
                    preamble: "Consider the following JSON in question, answer, input format. Say 'yes' if the input is a suitable answer to the question based on the correct answer given. Say 'no' otherwise." 
                }
            ).then(
                (response)=>{
                    res.send(response.text);
                }
            )
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


