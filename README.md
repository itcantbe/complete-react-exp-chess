# Welcome to 2 Player Chess!

This Project was made to be a complete Chess system for analysis and practice. It enables users to play games, watch games *(using PGN files)*, provide positions to board as puzzles using FEN and get analysis for the same by **STOCKFISH 11**

# Description

This project was made using **React** and **Express**. The projects are connected via proxy and can be run on local using the following command:
> Node is required in your machine to run the project. you can install it from [here](https://nodejs.org/en/download/).

 - Open the base folder and run `npm install`
 - After node modules are installed run `npm start dev`
 - Open a new terminal and go to folder **chess-react**
 - Run `npm install` and `npm start dev` 
 - You will be redirected to http://localhost:3000. Enjoy!

## Functionalities

Currently the project has the following functionalities:

 - Standard complete 2 player Chess
 - [PGN](https://en.wikipedia.org/wiki/Portable_Game_Notation) import and Game Viewer  
 - [FEN](https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation#:~:text=variants%20like%20Chess960-,Definition,each%20separated%20by%20a%20space.) import and Analysis for puzzles
 - Exporting FEN and PGN of Current Game
 - Get Best move at the current position
 - Getting Evaluation bar based on current and future analysis
 - Getting Future moves based on depth provided

## In Progress

The following things are in progress and will be available soon, in the following order:

 1. Multi-game PGN Viewer
 2. Request Undo Move
 3. PGN Game analysis with stockfish
 4. Possible moves on click of piece
 5. UI Revamp
 6. Stockfish Upgradation

## Libraries used

The following libraries have been used in making the project:

 - react-chessboard 
 - chess.js 
 - stockfish

## Contribute to project:

I am always open to contribution. Reach out to me on rohit.tiwari506@gmail.com with suggestion or directly raise pull request on project. 

```
