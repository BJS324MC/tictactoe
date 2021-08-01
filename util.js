function pass(){
  next=turn;
  turn=turn==="X"?"O":"X";
}
function legalMoves(){
  let moves=[];
  for(let m in game){
    if(game[m]===" ")moves.push(m);
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
function hasDrawn() {
  return game.every(a => a !== " ");
}
function reset() {
  game = game.map(a => " ");
  gameEnded = false;
  for (let m in tiles) tiles[m].innerText = " ";
  updateStatus();
}
function hasWon() {
  return mates.some(a => game[a.charAt(0)] === next && game[a.charAt(1)] === next && game[a.charAt(2)] === next);
}
function set(m,v){
  game[m]=v;
  tiles[m].innerText=v;
}
function loading() {
  status.innerText = "Tic Tac Toe";
  loadscreen = setInterval(() => {
    if (gameEnded) reset();
    playRandom();
    gameEnded = hasWon() || hasDrawn();
    status.innerText = "Tic Tac Toe";
  }, 500);
};