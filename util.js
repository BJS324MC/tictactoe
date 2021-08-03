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