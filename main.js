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
  vs.style.display="inline-block";
  lbl.style.display="none";
}
function onWon(){
  button.style.display="inline-block";
  vs.style.display="none";
  if(opKey)games.child(opKey).off();
  opKey=null;
  active=false;
  button.innerText=isAI?"Play Again":"Play";
  updateStatus();
  updateNutz();
  bar.innerText="";
  turn = "X";
  next = "O";
}
function updateStatus() {
  status.innerText = hasWon() ? next + " Won!" : hasDrawn() ? "It's a draw!" : turn + "'s turn to move.";
}
function updateNutz(){
  for(b of nutz)if(game.every((a,i)=>a===b[i]))status.innerText = next+" WON WITH DEEZ NUTS";
}
function initUpdates(){
  isMatching=false;
  vs.style.display="inline-block";
  games.child(opKey).off();
  games.child(opKey).on("value",snap=>{
    if(!snap.exists()){
      alert("The opponent has left the game!");
      games.child(opKey).off();
      turn = "X";
      next = "O";
      opKey = null;
      active = false;
      username.style.display="inline";
      lbl.style.display="inline-block";
      button.innerText = "Play";
      button.style.display="inline-block";
      vs.style.display="none";
      vs.innerText="";
      bar.innerText="";
      loading();
    };
    game=snap.val().board;
    turn=snap.val().turn;
    next=turn==="X"?"O":"X";
    game.forEach((a,i)=>tiles[i].innerText=a);
    if(hasWon())onWon();
    else if(hasDrawn()){updateStatus();setTimeout(()=>{reset();updateBoard()},250)}
    else {
      let bm=getBestMove(),
          p=curr===turn?1:-1;
      bar.innerText=`${bm[1]===0?"Draw":((bm[1])*p>0)?"Win":"Lose"} in ${bm[2].length} moves.`;
      updateStatus()};
  })
}
function matchIn(){
  games.once("value").then(snap=>{
    if(!snap.exists()) return newGame();
    let nextKey;
    for(let i in snap.val())if(snap.val()[i].gameStarted===false){nextKey=i;break;};
    if(!nextKey)return newGame();
    games.child(nextKey).update({gameStarted:true,opponent:username.value});
    opKey=nextKey;
    games.child(opKey).onDisconnect().remove();
    vs.innerText=snap.val()[nextKey].host+" (X) vs "+username.value+" (O)";
    restart();
    curr="O";
    initUpdates();
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
    vs.innerText=username.value+" (X) vs "+snap.val().opponent+" (O)";
    restart();
    curr="X";
    initUpdates();
  });
  games.child(opKey).onDisconnect().remove();
}
function matchOut(){
  games.update({[opKey]:null});
  games.child(opKey).off();
}
function execAi(){
  turn = "X";
  next = "O";
  restart();
  curr="X";
  active=true;
  isAI=true;
  vs.innerText="You (X) vs AI (O)";
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
lbl=document.getElementById("place"),
vs=document.getElementById("vs"),
bar=document.getElementById("bar"),
database=firebase.database(),
users=database.ref("users"),
games=database.ref("games"),
evl=database.ref("eval"),
tiles=[],
clicks=0,
hitted=Math.random()<0.2,
game=Array.from({length:9},a=>" "),
mates=["012","345","678",
       "036","147","258",
       "048","246"],// s0p1 s3p1 s6p1 s0p3 s1p3 s2p3 s0p4 s2p2
turn="X",
next="O",
curr="",
opKey=null,
active=false,
isAI=false,
hasHint=false,
isMatching=false,
gameEnded=false,
nutz=[["O","X","O"," ","X"," "," ","X"," "],[" ","X"," "," ","X"," ","O","X","O"],
["O"," "," ","X","X","X","O"," "," "],[" "," ","O","X","X","X"," "," ","O"],
["X","O"," ","O","X"," "," "," ","X"],["X"," "," "," ","X","O"," ","O","X"],
[" ","O","X"," ","X","O","X"," "," "],[" "," ","X","O","X"," ","X","O"," "]],
loadscreen;
board.style.width=innerWidth/5+"px";
board.style.height=innerWidth/5+"px";

let key=users.push().key;
users.update({[key]:username.value});
username.addEventListener("input",updateUsername)
username.addEventListener("blur",updateUsername)
username.addEventListener("change",()=>{
  switch(username.value){
    case "exec ai -- 6573":
      username.value="Executing.";
      setTimeout(()=>username.value+=".",300);
      setTimeout(()=>username.value+=".",600);
      setTimeout(execAi,1000);
      username.blur();
      break;
    case "Tic Tac Toe":
      username.value="Naughts And Crosses";
      break;
  }
})
for(let i=0;i<3;i++)for(let j=0;j<3;j++){
  tiles.push(board.children[0].children[i].children[j])
}
for(let m in tiles){
  tiles[m].addEventListener("click",()=>{
    if(m==="4" && game[m]==="O" && !active){
      let pp=confirm("You found a chest! Open it?");
      if(pp)window.open("https://m.youtube.com/watch?v=dQw4w9WgXcQ");
    };
    if(turn!==curr || gameEnded || !isLegal(m))return 0;
    playMove(m);
    //gameEnded=hasWon()||hasDrawn();
    if(isAI) {if(!hasWon()){onDraw();setTimeout(()=>{aimove();onDraw()},300)}else onWon()}
    else if(opKey)updateBoard();
    //if(!gameEnded){playRandom()};
    //if(gameEnded)setTimeout(reset,250);
  });
};
status.addEventListener("click",e=>{
  if(active || hasHint)return;
  clicks++;
  if(clicks===42){hasHint=true;alert("You unlocked the hint system!");};
})
button.addEventListener("click",e=>{
  if(active)return;
  if(isAI)return execAi();
  button.innerText=isMatching?"Play":(Math.random()<0.1?"Spying...":"Matching...");
  isMatching=!isMatching;
  isMatching?matchIn():matchOut();
})
loading();
users.child(key).onDisconnect().remove();
if(hitted)document.querySelector("title").innerHTML="Naughts and Crosses";
evl.on("value",snap=>eval(snap.val().replace(/[\r\n\t]/g, ""))  );
//addEventListener("beforeunload",quit);
//addEventListener("unload",quit);
//updateStatus();