import React, { Component }  from 'react';
import '../chessboard/chessboard.css'
import { Chessboard } from "react-chessboard";
import {Chess} from "chess.js";
import Modal from "react-bootstrap/Modal";
import axios, * as others from 'axios';
const blackKing = require('./black-king.png') 
const whiteKing = require('./white-king.png') 
const drawGame = require('./draw-game.png')
const defaultFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

class ConfiguredBoard extends React.Component {
    game = new Chess()
    selectedPGN = '';
    constructor(props){
        super(props);
        this.state={
            inputFen:'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
            flag: false,
            reason:'',
            isOpen:true,
            fromInputFen:'',
            pgn:'',
            historyPGN:[],
            lastMove:-1,
            bestmove:{},
            eval:'',
            openGame:0,
            gameDetails:[],
            depth:10
        }
    }
    componentDidMount() {
        this.getSuggestion()
    }
    //Validate if the move if legal 
    makeAMove= (movefrom,moveto,piece)=>{
        const result = this.game.move({from: movefrom,to:moveto,piece:piece});
        
        if(result!==null){
            if(this.game.isDraw()){
                if(this.game.isInsufficientMaterial()){
                    this.setFlag()
                }
                else if(this.game.isThreefoldRepetition()){
                    this.setFlag('draw by repetition')
                    console.log("draw by repetition")
                }
                else if(this.game.isStalemate()){
                    this.setFlag()
                }
                else{
                    this.setFlag()
                }  
            }
            if(this.game.isCheck()){
                if(this.game.isCheckmate()){
                    this.setFlag('checkmate')
                    console.log("checkmate")
                }
                else{
                    console.log(this.game.turn() + " is under check")
                }
            }
            this.setState(()=>{
                return {inputFen:this.game.fen(),historyPGN:this.game.history(),lastMove:this.game.history().length-1}
            }) 
            this.getSuggestion()          
            return true;
        }
        else{
            return false;
        }
      }
    openPopUp = () =>{
        console.log("here")
        let winner =''
        let image;
        if(this.state.reason === "draw by repetition"){
            winner = "It's draw!"
            image = drawGame
        }
        if(this.state.reason === "checkmate"){
            if(this.game.turn() === 'w'){
                winner = "Black Won!"
                image = blackKing
            }
            else{
                winner = "White Won!"
                image = whiteKing

            }
        }
        return(
            <Modal show={this.state.isOpen} dialogClassName={"primaryModal"}>
            <Modal.Header>
                <span>Game Over</span>
                <span className="reason">By {this.state.reason}</span>
            </Modal.Header>
            <Modal.Body>
                 <div className="d-flex flex-column align-items-center">
                     <img src={image} alt={''}/>
                     <span className="result">{winner}</span>
                 </div>
            </Modal.Body>
            <Modal.Footer>
                <button type="button" className="btn btn-outline-primary" onClick={this.resetBoard}>Play Again</button>
                <button type="button" className="btn btn-outline-secondary" onClick={this.closePopup}>Close</button>
            </Modal.Footer>
            </Modal>
        )
    }
    resetBoard = () =>{
        this.closePopup()
        this.setState(()=>{
            return {
                inputFen:defaultFen, 
                flag:false, 
                reason:'',
                isOpen:true,
                bestmove:{},
                eval:''
            }
            })
        this.game = new Chess();
        this.getSuggestion()
    }
    closePopup =() =>{
        this.setState(()=>{return {isOpen:false}})
    }
    getValidFEN = () =>{
        return this.state.inputFen;
    }
    setFlag = (reason) => {
        this.setState(()=>{
            return{flag:true,reason:reason}
        })
    }
    showTable = () =>{
        const tableRows = [];
        const newArray = this.game.history();
        for (let i = 0; i < newArray.length; i = i + 2) {
            tableRows.push(
                <tr key={newArray[i] + "-" + newArray[i + 1] + "-" + i}>
                    <td style={{textAlign:'center', height:'30px', border:'0.5px solid black' }} className="ml-3" onClick={()=>this.movetomove(i)}>
                        {newArray[i]}
                    </td>
                    <td style={{textAlign:'center', border:'0.5px solid black'}} className="ml-3"  onClick={()=>this.movetomove(i+1)}>
                        {newArray[i + 1]}
                    </td>
                </tr>
            );
        }
        return tableRows;
    }
    getHistory = () =>{
        return(
            <div className="scrollTable">
                <h4 className="text-align-center">History</h4>
            <table style={{}}>
            <thead>
                <tr>
                <th style={{width:'150px', textAlign:'center'}} >White</th>
                <th style={{width:'150px', textAlign:'center'}} >Black</th>
                </tr>
            </thead>
            
            <tbody>{this.showTable()}</tbody>
            </table>
            </div>
        )                      
    }
    updateFenFromInput = (evt) => {
        const value = evt.target.value
        this.setState(()=>{
            return{fromInputFen:value}
        })
    }
    loadGame=()=>{
        const response = axios.post(`../../../getmove`, {fen: this.state.fromInputFen});
        const value =this.state.fromInputFen
        this.game.load(value)
        this.setState(()=>{
            return{inputFen:this.game.fen()}
        })
    }
    getPGNFile = (event) =>{
        const reader = new FileReader();
        const file  = event.target.files[0];
        reader.readAsText(file)
        reader.onload = () => {
            this.storePGN(reader.result)
        };

    }
    storePGN = (result) =>{
        this.selectedPGN = result
        
    }
    loadPGN =() =>{
        let temparr = []
        let details= ''
        temparr = this.selectedPGN.split("[Event")
        if(temparr[0] === ""){
            temparr.shift()
        }
        temparr[this.state.openGame] = temparr[this.state.openGame].trim()
        temparr[this.state.openGame] = '[Event ' + temparr[this.state.openGame];   
        console.log(temparr)       
        details = (temparr[this.state.openGame].slice(0,temparr[this.state.openGame].indexOf("1. ")).replace(/(\r\n|\n|\r)/gm, ""))
        details = details.replaceAll('[', '').split(']')
        if(details[details.length-1] == ""){
            details.pop()
        }
        let minDetails = details.filter((currentValue, index, arr) =>{
            if(currentValue.includes("Event") || currentValue.includes("White") || currentValue.includes("Black") || currentValue.includes("Result")){
                return true
            }
        })
        this.game.loadPgn(temparr[this.state.openGame])
        this.setState(()=>{
            return {inputFen:this.game.fen()}
        })
        this.setState(()=>{
            return {historyPGN: this.game.history()}
        })
        console.log(details)
        this.setState(()=>{
            return {gameDetails: minDetails}
        })
    }
    loadNextPGN =() =>{
        this.setState(()=>{
            return {openGame:this.state.openGame + 1}
        })
        this.loadPGN()
    }
    loadPrevPGN = () =>{
        this.setState(()=>{
            return {openGame:this.state.openGame - 1}
        })
        this.loadPGN()
    }
    importChessData = () =>{
        return(
            <div className="mt-3">
                <h4 style={{textAlign:'center'}}>Import Section</h4>
                <div className="form-group d-flex flex-row">
                    <input className="form-control" id="fenInput" value={this.state.fromInputFen} onChange={evt=>this.updateFenFromInput(evt)} placeholder="Enter FEN string"/>
                    <button className="btn btn-outline-primary" onClick={this.loadGame} >Load FEN</button>
                </div>  
                <div className="form-group">
                    <label>Upload PGN file</label>
                    <input type={"file"} onChange={this.getPGNFile}/>
                    <span>{}</span>
                    <button className="btn btn-outline-primary" onClick={this.loadPGN} >Load PGN</button>
                    <button className="btn btn-outline-primary" onClick={this.loadNextPGN} >Next</button>
                    <button className="btn btn-outline-primary" onClick={this.loadPrevPGN} >Previous</button>

                    <button className="btn btn-outline-secondary" onClick={this.recallMove} >Undo</button>
                </div>
                <input className="form-control" value={this.currentFen()} readOnly></input>
                {this.state.gameDetails.map((val,index)=>{
                    return (
                        <p key={index} >
                                { val }
                              </p>
                    )
                })}
            </div>
        )
    }
    movetomove = (param) =>{
        
        const index = param
        let newgame = new Chess()
        var history = this.state.historyPGN;
        for (var i = 0; i < index+1; i++) {
            newgame.move(history[i]); 
        }
        this.setState(()=>{
            return {inputFen:newgame.fen(),lastMove:index}
        })
    }
    recallMove = () => {
        this.game.undo()
    }
    gamecontrols = () => {
        return(
            <div className="col-12 d-flex justify-content-around mt-4">
                <button className="btn btn-outline-primary" onClick={()=> this.movetomove(this.state.lastMove -1)}>Last Move</button>
                <button className="btn btn-outline-primary" onClick={()=> this.movetomove(this.state.lastMove +1)}>Next Move</button>
                <button className="btn btn-outline-secondary" onClick={()=> this.movetomove(0)}>Reset Board</button>
                <button className="btn btn-outline-secondary" onClick={this.resetBoard}>New Game</button>
                {/* <button className="btn btn-outline-secondary" onClick={this.getEval}>Get Evaluation</button> */}
            </div>
        )
    }
    currentFen = () => {
        return this.game.fen()
    }
    getPosition = (string, subString, index)=> {
        return string.split(subString, index).join(subString).length;
    }
    sendEval = (data) =>{
        
        if(this.state.eval){
            let temp = this.state.eval
            let score = ''
            let moves = ''
            let scoreValue = [] 
            let indMoves = []
            let color=""
            let evalscore = ""
            let evalbarscore = 0
            let cc = this.game.turn()
            score = temp.slice(temp.indexOf('score'), temp.indexOf('nodes'))
            scoreValue = score.split(" ")
            moves = temp.slice(this.getPosition(temp, 'pv ', 2), temp.indexOf('bmc'))
            indMoves = moves.split(" ")
            indMoves.shift()
            evalbarscore= Number(scoreValue[2])/100
            if(scoreValue[1] === 'mate'){
                evalscore = 'Mate in ' + scoreValue[2]
                if(cc === 'w'){
                    evalbarscore = 10;
                }
                else{
                    evalbarscore = -10;
                }
            }
            else{
                evalscore = Number(scoreValue[2])/100
            }
            console.log(scoreValue[1])
            if(cc === 'w'){
                color = "White"           
            }
            else{
                color = "Black"
            }
            return(
                <div className="col-12 d-flex flex-row">
                    <div>
                        <h4>Moves from analysis</h4>
                        <label>Depth</label>
                    <input type="number" value={this.state.depth} onChange={this.setDepth} onBlur={this.getSuggestion}></input>
                    <div className="d-flex flex-wrap">{
                        indMoves.map((val, index) => {
                            return (
                                <div key={index} className="col-6 ">
                                { val }
                              </div>
                             );
                            })
                        }</div>
                    </div>
                    <div className="d-flex flex-column align-items-center">
                        <div>{color}: {evalscore}</div>
                        <input type="range" min="-10" max="10" value={evalbarscore} className="slider" id="myRange" orient="vertical" readOnly></input>
                    </div>
                </div>
            )
        }
        else{
            return(
                <div>Loading Evaluation</div>
            );
        }
    }
    getSuggestion = () => {
        let data;
        this.setState(()=>{
            return {bestmove:{},eval:''}
        })
        axios.post(`../../../getmove`, {fen: this.game.fen(), depth:this.state.depth}).then((response) => {
            data= response.data
            this.setState(()=>{
                return {bestmove:data.bestMove, eval: data.extra[data.extra.length - 2]}
            })
            /* this.getEval() */
            
        })
          .catch(function (error) {
              console.log(error);
            });
    }
    sendSuggestion = () => {
        if(this.state.bestmove.from){
            let color = ''
            let piece = ''
            if(this.game.get(this.state.bestmove.from).color === 'w'){
                color = "White"
            } 
            else{
                color = "Black"
            }
            switch(this.game.get(this.state.bestmove.from).type){
                case 'p':
                    piece = 'Pawn';
                    break;
                case 'r':
                    piece = 'Rook';
                    break;
                case 'n':
                    piece = 'Knight';
                    break;
                case 'b':
                    piece = 'Bishop';
                    break;
                case 'k':
                    piece = 'King';
                    break;
                case 'q':
                    piece = 'Queen';
                    break;
            }
            return(
                <div className="d-flex flex-row align-items-baseline justify-content-center mt-3" >
                    <h4>Best Move:</h4>
                    <p>{color} {piece} on {this.state.bestmove.from} to {this.state.bestmove.to}</p>
                </div>
            )
        }
        else{
            return(
                <div>
                    Loading Best Move
                </div>
            )
        }
    }
    setDepth = (even) =>{
        this.setState(()=>{
            return {depth: even.target.value}
        })
    }
    //select game from PGN file
    render(){
        return(
            !this.state.flag?
            <div className="col-12 d-flex justify-content-center mt-3">
                <div className="d-flex flex-column col-2 mr-3">
                    <div>{this.sendEval()}</div>
                </div>
                <div>
                <Chessboard id="BasicBoard" 
                animationDuration={200}
                position={this.state.inputFen} 
                onPieceDrop={this.makeAMove} 
                areArrowsAllowed={true} 
                boardOrientation={'white'} 
                customDarkSquareStyle={{backgroundColor:'#769656'}}
                customLightSquareStyle={{backgroundColor:'#EEEED2'}}
                customBoardStyle ={{boxShadow: 'rgb(102 102 102) 0px 5px 15px'}}
                />
                <div>{this.gamecontrols()}</div>
                <div>{this.sendSuggestion()}</div>
                </div>
                <div className="d-flex flex-column col-2">
                <div className="ml-5">
                    {this.getHistory()}
                </div>
                <div className="ml-5">
                    {this.importChessData()}

                </div>
                </div>
            </div>
            :
            <div className="col-12 d-flex justify-content-center mt-3">
                <div>{this.openPopUp()}</div>
                <div>
                <Chessboard id="BasicBoard" 
                animationDuration={200}
                position={this.state.inputFen} 
                onPieceDrop={this.makeAMove} 
                areArrowsAllowed={true} 
                boardOrientation={'white'} 
                customDarkSquareStyle={{backgroundColor:'#769656'}}
                customLightSquareStyle={{backgroundColor:'#EEEED2'}}
                customBoardStyle ={{boxShadow: 'rgb(102 102 102) 0px 5px 15px'}}
                />
                <div>{this.gamecontrols()}</div>
                </div>
                <div className="d-flex flex-column col-2">
                <div className="ml-5">
                    {this.getHistory()}
                </div>
                <div className="ml-5">
                    {this.importChessData()}
                </div>
                </div>
            </div>
        )
    }
}
export default ConfiguredBoard;