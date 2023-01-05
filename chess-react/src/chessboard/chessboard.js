import React from "react";
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
            lastMove:-1
        }
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
            axios.post(`../../../getmove`, {fen: this.game.fen(), depth:"18"}).then(function (response) {
                console.log(response.data);
              })
              .catch(function (error) {
                console.log(error);
              });
              
              
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
                isOpen:true
            }
            })
        this.game = new Chess();
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
        console.log(response.data)
        const value =this.state.fromInputFen
        console.log(value)
        this.game.load(value)
        console.log(this.game.load(value))
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
        console.log('getting called')
        this.selectedPGN = result
        
    }
    loadPGN =() =>{
        let temparr = []
        temparr = this.selectedPGN.split("[Event")
        if(temparr[0] === ""){
            temparr.shift()
        }
        temparr[0] = temparr[0].trim()
        temparr[0] = '[Event ' + temparr[0];          
        console.log(this.game.loadPgn(temparr[0]))
        this.game.loadPgn(temparr[0])
        this.setState(()=>{
            return {inputFen:this.game.fen()}
        })
        this.setState(()=>{
            return {historyPGN: this.game.history()}
        })
        
    }
    importChessData = () =>{
        return(
            <div className="mt-3">
                <h4 style={{textAlign:'center'}}>Import Section</h4>
                <div className="form-group">
                    <label>Enter FEN string</label>
                    <input className="form-control" id="fenInput" value={this.state.fromInputFen} onChange={evt=>this.updateFenFromInput(evt)} />
                    <button className="btn btn-outline-primary" onClick={this.loadGame} >Load FEN</button>
                </div>  
                <div className="form-group">
                    <label>Upload PGN file</label>
                    <input type={"file"} onChange={this.getPGNFile}/>
                    <span>{}</span>
                    <button className="btn btn-outline-primary" onClick={this.loadPGN} >Load PGN</button>
                    <button className="btn btn-outline-secondary" onClick={this.recallMove} >Undo</button>
                </div>          
            </div>
        )
    }
    movetomove = (param) =>{
        
        const index = param
        let newgame = new Chess()
        var history = this.state.historyPGN;
        for (var i = 0; i < index+1; i++) {
            console.log(newgame.move(history[i]), history[i])
            newgame.move(history[i]); 
        }
        this.setState(()=>{
            return {inputFen:newgame.fen(),lastMove:index}
        })
    }
    recallMove = () => {
        this.game.undo()
        console.log(this.game.undo())
    }
    gamecontrols = () => {
        return(
            <div className="col-12 d-flex justify-content-around mt-4">
                <button className="btn btn-outline-primary" onClick={()=> this.movetomove(this.state.lastMove -1)}>Last Move</button>
                <button className="btn btn-outline-primary" onClick={()=> this.movetomove(this.state.lastMove +1)}>Next Move</button>
                <button className="btn btn-outline-secondary" onClick={()=> this.movetomove(0)}>Reset Board</button>
                <button className="btn btn-outline-secondary" onClick={this.resetBoard}>New Game</button>
                <button className="btn btn-outline-secondary" onClick={this.getEval}>Get Evaluation</button>
            </div>
        )
    }
    currentFen = () => {
        return this.game.fen()
    }
    getEval = ()=>{
        axios.post(`../../../getEval`, {fen: this.game.fen(), depth:"18"}).then(function (response) {
            console.log(response.data);
          })
          .catch(function (error) {
            console.log(error);
          });
    }
    //select game from PGN file
    render(){
        return(
            !this.state.flag?
            <div className="col-12 d-flex justify-content-center mt-3">
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
                <div>{this.currentFen()}</div>
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