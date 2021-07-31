function playMove(m){
  set(m, turn);
  pass();
  updateStatus();
}
function updateBoard(){
  games.child(opKey).update({board:game,turn:turn})
}
function restart(){
  reset();
  active = true;
  isMatching=false;
  clearInterval(loadscreen);
  turn = "X";
  next = "O";
  button.style.display="none";
  username.style.display="none";
}
function onWon(){
  button.style.display="block";
  games.child(opKey).off();
  opKey=null;
  active=false;
  turn="X";
  next="O";
}
function updateStatus() {
  status.innerText = hasWon() ? next + " Won!" : hasDrawn() ? "It's a draw!" : turn + "'s turn to move.";
}
function initUpdates(){
  games.child(opKey).off();
  games.child(opKey).on("value",snap=>{
    if(!snap.exists())alert("The opponent has left the game!")
    game=snap.val().board;
    turn=snap.val().turn;
    game.forEach((a,i)=>tiles[i].innerText=a);
    updateStatus();
  })
}
function matchIn(){
  games.once("value").then(snap=>{
    if(!snap.exists()) return newGame();
    let nextKey;
    for(let i in snap.val())if(snap.val()[i].gameStarted===false){nextKey=i;break;};
    if(!nextKey)return newGame();
    games.child(nextKey).update({gameStarted:true,opponent:key});
    opKey=nextKey;
    restart();
    curr="O";
  })
}
function newGame(){
  opKey=games.push().key;
  games.child(opKey).update({
    "host":username.value,
    "opponent":false,
    "gameStarted":false,
    board:Array.from({length:9},a=>" "),
    turn:"X"
  });
  games.child(opKey).on("value",snap=>{
    if(!snap.val().gameStarted)return;
    restart();
    curr="X";
    initUpdates();
  });
}
function matchOut(){
  games.update({[opKey]:null});
  games.child(opKey).off();
}
function updateUsername(){
  users.update({[key]:username.value});
  if(isMatching)games.update({[opKey]:{
    "host":username.value,
    "opponent":false,
    "gameStarted":false,
    board:Array.from({length:9},a=>" "),
    turn:turn
  }
  });
}
let board=document.getElementById("board"),
status=document.getElementById("status"),
button=document.getElementById("play"),
username=document.getElementById("name"),
database=firebase.database(),
users=database.ref("users"),
games=database.ref("games"),
tiles=[],
game=Array.from({length:9},a=>" "),
mates=["012","345","678",
       "036","147","258",
       "048","246"],// s0p1 s3p1 s6p1 s0p3 s1p3 s2p3 s0p4 s2p2
turn="X",
next="O",
curr="",
opKey=null,
active=false,
isMatching=false,
gameEnded=false,
loadscreen;
board.style.width=innerWidth/5+"px";
board.style.height=innerWidth/5+"px";

let key=users.push().key;
users.update({[key]:username.value});
username.addEventListener("input",updateUsername)
username.addEventListener("blur",updateUsername)
for(let i=0;i<3;i++)for(let j=0;j<3;j++){
  tiles.push(board.children[0].children[i].children[j])
}
for(let m in tiles){
  tiles[m].addEventListener("click",()=>{
    if(turn!==curr || gameEnded || !isLegal(m))return 0;
    playMove(m);
    gameEnded=hasWon()||hasDrawn();
    if(hasWon())onWon();
    updateBoard();
    //if(!gameEnded){playRandom()};
    //if(gameEnded)setTimeout(reset,250);
    updateStatus();
  });
};
button.addEventListener("click",e=>{
  if(active)return;
  button.innerText=isMatching?"Play":"Matching...";
  isMatching=!isMatching;
  isMatching?matchIn():matchOut();
})
loading();
users.onDisconnect().update({[key]:null});
games.onDisconnect().update({[opKey]:null});
//addEventListener("beforeunload",quit);
//addEventListener("unload",quit);
//updateStatus();