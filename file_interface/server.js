const express = require('express');
const next = require('next');
var { createServer } = require('http');
const multer = require('multer');
const upload = multer({ dest: 'notes/' });
const fs = require('fs');
const pdf = require('pdf-parse');
var { CohereClient } = require("cohere-ai");
const math = require('mathjs');


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
            //console.log(req.body)
            //console.log(JSON.stringify(req.body))

            const client = new CohereClient({ token: "EngU1XLXyXtDTRCYWHvpWuDJzHUyQxorejs1UgSa" });        


            (async () => {
                const response = await client.embed({
                    model: "embed-english-v3.0",
                    texts: [req.body.input, req.body.answer],
                    inputType: "classification",
                    truncate: "NONE"
                });
                let [answer, user_response] = response.embeddings;
                let similarity = math.dot(answer, user_response) / (math.norm(answer) * math.norm(user_response))
                console.log(similarity)
                if(similarity > 0.75){
                    res.send("Yes");
                }else{
                    res.send("No");
                }
                
            })();
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

function broadcast(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
        client.send(message);
        }
    });
}
wss.on('connection', function connection(ws) {
    ws.on('error', console.error);
    ws.on('message', function message(data) {
        console.log(data.toString())
        broadcast(data.toString())
    });
});
wsServer.listen(8081, () => {
    console.log("Listening on 8081")
});


