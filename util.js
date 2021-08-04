function pass(){
  next=turn;
  turn=turn==="X"?"O":"X";
}
function legalMoves(board=game){
  let moves=[];
  for(let m in board){
    if(board[m]===" ")moves.push(m);
  }
  return moves;
}
function pickRandom(arr){
  return arr[Math.floor(arr.length*Math.random())];
}
function playRandom() {
  playMove(pickRandom(legalMoves()));
}
function isLegal(m) {
  return game[m] === " ";
}
function hasDrawn(board=game) {
  return board.every(a => a !== " ");
}
function reset() {
  game = game.map(a => " ");
  gameEnded = false;
  for (let m in tiles) tiles[m].innerText = " ";
  updateStatus();
}
function hasWon(board=game,v=next) {
  return mates.some(a => board[a.charAt(0)] === v && board[a.charAt(1)] === v && board[a.charAt(2)] === v);
}
function set(m,v){
  game[m]=v;
  tiles[m].innerText=v;
}
function minimax(depth=9,board,isMax=true,max="X"){
  if(hasWon(board,isMax?max==="X"?"O":"X":max))return [null,(depth+1)*(isMax?-1:1),[]];
  else if(hasDrawn(board) || depth===0)return [null,0,[]];
  let bestMove=[null,isMax?-10:10,[]];
  legalMoves(board).forEach(a=>{
    board[a]=isMax?max:max==="X"?"O":"X";
    let bs=minimax(depth-1,board,!isMax,max);
    board[a]=" ";
    if((isMax && bs[1]>bestMove[1]) || (!isMax && bs[1]<bestMove[1])){
      bs[2].unshift(a);
      bestMove=[a,bs[1],bs[2]];
    };
  });
  return bestMove;
}
function getBestMove(depth=9){
  return minimax(depth,game.slice(),true,turn);
}
function aimove(){
  let blocks=[],
  wins=[];
  for(let m of mates){
    let checks=0,
    marks=0,
    pos=null;
    for(let i=0;i<m.length;i++){
      let s=game[m.charAt(i)];
      if(s===next)checks++;
      else if(s===turn)marks++;
      else if(s===" ")pos=m.charAt(i);
    }
    if(m.length-checks===1 && pos)blocks.push(pos);
    if(m.length-marks===1 && pos)wins.push(pos);
  };
  if(wins.length)playMove(pickRandom(wins));
  else if(blocks.length)playMove(pickRandom(blocks));
  else playRandom();
}
function onDraw(){
  if(hasDrawn())setTimeout(()=>{reset();updateStatus();},250)
}
function loading() {
  status.innerText = hitted?"Naughts And Crosses":"Tic Tac Toe";
  loadscreen = setInterval(() => {
    if (gameEnded) reset();
    playRandom();
    gameEnded = hasWon() || hasDrawn();
    status.innerText = hitted?"Naughts And Crosses":"Tic Tac Toe";
  }, 500);
};