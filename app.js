const express = require("express");
var bodyParser = require('body-parser')
const { Worker} = require('node:worker_threads');
const app = express();
var jsonParser = bodyParser.json()
/* const instockfish = require("stockfish"); */
var stockfish = require("stockfish");

console.log(stockfish)
const engine = stockfish();
engine.onmessage = function(msg) {
  return;
  /* console.log(msg); */
};
engine.postMessage("uci");

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.post('/getmove',jsonParser, (request, response) => {
  let tempMessage = []
  let sentDepth = Number(request.body.depth) 
  
  engine.onmessage = function(msg) {
    console.log(msg);
    if(msg.includes("info depth "+ sentDepth) || msg.includes("info depth "+ (sentDepth -1)) || msg.includes("info depth "+ (sentDepth - 2)) || msg.includes("bestmove")){
      tempMessage.push(msg)

    }
    console.log(tempMessage)
    // in case the response has already been sent?
    if (response.headersSent) {
        return;
    }
    // only send response when it is a recommendation
    if (typeof(msg == "string") && msg.match("bestmove")) {
      let obj={
        bestMove:{
          from:'',
          to:''
        }
      }  
      obj.bestMove.from = msg.slice(msg.indexOf('bestmove ')+9,msg.indexOf('bestmove ')+11)
      obj.bestMove.to = msg.slice(msg.indexOf('bestmove ')+11,msg.indexOf('bestmove ')+13)
      obj.extra = tempMessage
      /* obj.ponder = msg.slice(msg.indexOf('ponder ')+7,msg.indexOf('ponder ')+11) */
      response.send(obj);
    }
  }

// run chess engine
  engine.postMessage("ucinewgame");
  engine.postMessage("position fen " + request.body.fen);
  engine.postMessage("go depth +" + request.body.depth);
  });
const PORT = process.env.PORT || 8080;
  
app.listen(PORT, console.log(`Server started on port ${PORT}`));