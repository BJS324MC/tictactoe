function playMove(m) {
  set(m, turn);
  pass();
  updateStatus();
}

function updateBoard() {
  games.child(opKey).update({ board: game, turn: turn })
}

function hideElements() {
  button.style.display = "none";
  vs.style.display = "inline-block";
  smal.style.display = "none";
  status.style.display = "inline-block";
  header.style.display = "none";
  login.style.display = "none";
  back.style.display = "none";
  profile.style.display="none";
  vs.style.backgroundImage="url("+curr+".png)";
}

function restart() {
  reset();
  active = true;
  isMatching = false;
  clearInterval(loadscreen);
  loadscreen = false;
  turn = "X";
  next = "O";
  hideElements();
}

function onWon() {
  button.style.display = "block";
  if (opKey) games.child(opKey).off();
  opKey = null;
  active = false;
  button.innerText = isAI ? "Play Again" : "Play";
  updateStatus();
  updateNutz();
  let vlt=isAI ?0:(turn===curr)?-20:20;
  vs.querySelector("#p1 > span").innerText=thisUser.points + (vlt<0?"-"+(-vlt):"+"+vlt);
  thisUser.points+=vlt;
  updateUser();
  bar.innerText = "";
  turn = "X";
  next = "O";
  if (act) losses++;
  button.style.animation = "";
  back.style.display = "inline-block";
}

function updateStatus() {
  status.innerText = hasWon() ? next + " Won!" : hasDrawn() ? "It's a draw!" : turn + "'s turn to move.";
}

function updateNutz() {
  for (b of nutz)
    if (game.every((a, i) => a === b[i])) status.innerText = next + " WON WITH DEEZ NUTS";
}

function initUpdates() {
  isMatching = false;
  vs.style.display = "inline-block";
  games.child(opKey).off();
  games.child(opKey).on("value", snap => {
    if (!snap.exists()) {
      alert("The opponent has left the game!");
      games.child(opKey).off();
      turn = "X";
      next = "O";
      opKey = null;
      active = false;
      smal.style.display = "inline-block";
      status.style.display = "none";
      header.style.display = "inline-block";
      button.innerText = "Play";
      button.style.display = "inline-block";
      vs.style.display = "none";
      button.style.animation = "";
      bar.innerText = "";
      loading();
    };
    game = snap.val().board;
    turn = snap.val().turn;
    next = turn === "X" ? "O" : "X";
    game.forEach((a, i) => tiles[i].innerText = a);
    if (hasWon()) onWon();
    else if (hasDrawn()) {
      updateStatus();
      setTimeout(() => {
        reset();
        updateBoard()
      }, 250)
    }
    else {
      if (hasHint) {
        let bm = getBestMove(),
          p = curr === turn ? 1 : -1;
        bar.innerText = `${bm[1]===0?"Draw":((bm[1])*p>0)?"Win":"Lose"} in ${bm[2].length} moves.`;
      }
      updateStatus()
    };
  })
}

function matchIn() {
  games.once("value").then(snap => {
    if (!snap.exists()) return newGame();
    let nextKey;
    for (let i in snap.val())
      if (snap.val()[i].gameStarted === false) { nextKey = i; break; };
    if (!nextKey) return newGame();
    games.child(nextKey).update({ gameStarted: true, opponent: thisUser });
    opKey = nextKey;
    games.child(opKey).onDisconnect().remove();
    curr = "O";
    restart();
    setVs(snap.val()[opKey].host);
    initUpdates();
  })
}

function newGame() {
  opKey = games.push().key;
  games.child(opKey).update({
    "host": thisUser,
    "opponent": false,
    "gameStarted": false,
    board: Array.from({ length: 9 }, a => " "),
    turn: "X"
  });
  games.child(opKey).on("value", snap => {
    if (!snap.val() || !snap.val().gameStarted) return;
    curr = "X";
    restart();
    setVs(snap.val().opponent);
    initUpdates();
  });
  games.child(opKey).onDisconnect().remove();
}

function matchOut() {
  games.update({
    [opKey]: null
  });
  games.child(opKey).off();
}

function execAi() {
  curr = "X";
  restart();
  active = true;
  isAI = true;
  if (losses === 5 && act) {
    losses = 0;
    reversed = !reversed;
  };
  setVs({
    username:act ? reversed ? "noisreV lamitpO,IA": "AI,Optimal Version" : "AI",
    points:10000,
    picture:act ? "bot2.png":"bot.png"
  })
}

function readUser(func) {
  users.child(uid).once("value").then(snap => {
    if (!snap.exists()) return func();
    thisUser = snap.val();
    username.innerText = thisUser.username;
    profile.querySelector("span").innerText = thisUser.points;
    profile.querySelector("img").src = thisUser.picture || "nobody.png";
    descript.querySelector("span").innerText = thisUser.description;
  })
}

function updateUser() {
  users.update({
    [uid]: thisUser
  });
  username.innerText = thisUser.username;
  profile.querySelector("span").innerText = thisUser.points;
  profile.querySelector("img").src = thisUser.picture || "nobody.png";
  descript.querySelector("span").innerText= thisUser.description;
  if (isMatching) games.update({
    [opKey]: {
      "host": thisUser,
      "opponent": false,
      "gameStarted": false,
      board: Array.from({ length: 9 }, a => " "),
      turn: turn
    }
  });
}

function setAccountInfo(user) {
  thisUser.username = user.displayName;
  thisUser.picture = user.photoURL;
  thisUser.description="";
  updateUser();
}

function setStateText(text) {
  logger.style.display = "none";
  header.innerText = text;
  drop.style.display = "none";
  google.style.display = "none";
  create.style.display = "none";
}
function setVs(user){
  vs.querySelector("#p1 > img").src=thisUser.picture || "nobody.png";
  vs.querySelector("#p1 > p").innerText=thisUser.username;
  vs.querySelector("#p1 > span").innerText=thisUser.points;
  vs.querySelector("#p2 > img").src=user.picture || "nobody.png";
  vs.querySelector("#p2 > p").innerText=user.username;
  vs.querySelector("#p2 > span").innerText=user.points;
}
function homePage(){
  isAI=false;
  for (let n of document.querySelectorAll("td")) n.style.borderColor = "#4BD81E";
  status.style.display = "none";
  header.style.display = "inline-block";
  google.style.display = "none";
  drop.style.display = "none";
  login.style.display = "inline-block";
  logger.style.display = "none";
  button.style.display = "block";
  smal.style.display = "inline";
  header.innerText = headerText;
  create.style.display = "none";
  profile.style.display = "inline-block";
  back.style.display = "none";
  vs.style.display = "none";
  google.querySelector("span").innerText = "Log In With Google";
  createText.nodeValue = "No accounts? ";
  createA.innerText = "Create one!";
  logger.innerText = "Log In";
  logout.style.display = "none";
  profile.querySelector("br").style.display = "inline";
  username.style.fontSize = "15pt";
  username.style.margin = "20px 0";
  descript.style.display="none";
  profile.style.minWidth="0";
  profile.querySelector("span").style.margin = "0";
  profile.querySelector("#info").style.display = "block";
  profile.querySelector("#info2 > p").style.display="none";
  profile.querySelector("#info > img").style.display="none";
  profile.querySelector("#editpic").style.display="none";
  button.innerText="Play";
}
function pointF(txt) {
  thisUser.username = txt + ".";
  setTimeout(() => thisUser.username += ".", 500);
  setTimeout(() => thisUser.username += ".", 1000);
}

function seqF(arr) {
  arr.forEach((a, i) => setTimeout(() => pointF(a), 1500 * i));
}
let board = document.getElementById("board"),
  header = document.getElementById("header"),
  status = document.getElementById("status"),
  button = document.getElementById("play"),
  vs = document.getElementById("vs"),
  bar = document.getElementById("bar"),
  smal = document.querySelector("sub"),
  drop = document.getElementById("dropdown"),
  profile = document.getElementById("profile"),
  login = document.getElementById("login"),
  logger = document.getElementById("logger"),
  create = document.getElementById("create"),
  createA = create.querySelector("a"),
  createText = create.childNodes[0],
  google = document.getElementById("google"),
  back = document.getElementById("back"),
  username = document.getElementById("username"),
  logout=document.getElementById("logout"),
  descript=document.getElementById("descript"),
  database = firebase.database(),
  users = database.ref("users"),
  games = database.ref("games"),
  evl = database.ref("eval"),
  thisUser = {
    username: "Guest" + (Math.random().toString().slice(2)),
    points: 100
  },
  tiles = [],
  clicks = 0,
  hitted = Math.random() < 0.2,
  headerText = hitted ? "Naughts And Crosses" : "Tic Tac Toe",
  game = Array.from({ length: 9 }, a => " "),
  mates = ["012", "345", "678",
       "036", "147", "258",
       "048", "246"], // s0p1 s3p1 s6p1 s0p3 s1p3 s2p3 s0p4 s2p2
  turn = "X",
  next = "O",
  curr = "",
  opKey = null,
  uid = null,
  active = false,
  isAI = false,
  hasHint = false,
  isMatching = false,
  isAnonymous = true,
  gameEnded = false,
  nutz = [["O", "X", "O", " ", "X", " ", " ", "X", " "], [" ", "X", " ", " ", "X", " ", "O", "X", "O"],
["O", " ", " ", "X", "X", "X", "O", " ", " "], [" ", " ", "O", "X", "X", "X", " ", " ", "O"],
["X", "O", " ", "O", "X", " ", " ", " ", "X"], ["X", " ", " ", " ", "X", "O", " ", "O", "X"],
[" ", "O", "X", " ", "X", "O", "X", " ", " "], [" ", " ", "X", "O", "X", " ", "X", "O", " "]],
  listz = ["O", "O", "X", "O", "O", "X", "X", "X", "O", "X"],
  lst = "",
  act = false,
  losses = 0,
  mode = 0,
  tmt = "",
  tnt = "",
  loadscreen = false;
reversed = false;
board.style.width = innerWidth / 5 + "px";
board.style.height = innerWidth / 5 + "px";

/*username.addEventListener("input", updateUsername)
username.addEventListener("blur", updateUsername)
username.addEventListener("change", () => {
  switch (username) {
    case "exec ai -- 6573":
      username = "Executing.";
      setTimeout(() => username += ".", 300);
      setTimeout(() => username += ".", 600);
      setTimeout(execAi, 1000);
      username.blur();
      break;
    case "8979853283856775":
      username.blur();
      let tt = 10;
      act = true;

      function tm() {
        if (listz[10 - tt] === lst) {
          tt--;
          lst = "";
          if (tt === 0) {
            setTimeout(execAi, 12500);
            return seqF(["Vaildating", "Compressing", "Posting", "Receiving", "Extracting", "Cleaning", "Executing", "Redirecting"])
          };
          username = tt;
          setTimeout(tm, 1000)
        } else {
          username = "Invaild!";
          act = false;
          lst = "";
          setTimeout(() => username = "Guest", 500);
        };
      }
      username = tt;
      setTimeout(tm, 1000);
      break;
    case "Tic Tac Toe":
      username = "Naughts And Crosses";
      break;
  }
})*/
for (let i = 0; i < 3; i++)
  for (let j = 0; j < 3; j++) {
    tiles.push(board.children[0].children[i].children[j])
  }
for (let m in tiles) {
  tiles[m].addEventListener("click", () => {
    if (act && lst == "") {
      lst = game[m];
      username += " " + lst;
    }
    else if (m === "4" && game[m] === "O" && !active) {
      let pp = confirm("You found a chest! Open it?");
      if (pp) window.open("https://m.youtube.com/watch?v=dQw4w9WgXcQ");
    };
    if (turn !== curr || gameEnded || !isLegal(m)) return 0;
    playMove(m);
    if (isAI) {
      if (!hasWon()) {
        onDraw();
        setTimeout(() => {
          aimove();
          if (!hasWon()) onDraw();
          else onWon()
        }, 300)
      } else onWon()
    }
    else if (opKey) updateBoard();
  });
};
header.addEventListener("click", e => {
  if (active || hasHint) return;
  clicks++;
  if (clicks === 42) {
    hasHint = true;
    alert("You unlocked the hint system!");
  };
})
button.addEventListener("click", e => {
  if (active) return;
  if (isAI) return execAi();
  button.innerText = isMatching ? "Play" : (Math.random() < 0.1 ? "Spying" : "Matching");
  isMatching = !isMatching;
  isMatching ? matchIn() : matchOut();
  if (isMatching) button.style.animation = "slide 0.8s ease-in-out infinite";
  else button.style.animation = "";
})
logout.addEventListener("click", e => {
  if (confirm("Are you sure you want to sign out?")) {
    firebase.auth().signOut();
    login.innerText="Log In";
    document.body.style.animation = "disappear 0.5s";
    document.getElementById("logo").style.animation = "rotate 1s";
    document.getElementById("logo").addEventListener("animationend", function hand() {
      document.getElementById("logo").style.animation = "";
    });
    document.body.addEventListener("animationend", function handler() {
      document.body.removeEventListener("animationend", handler);
      document.body.style.animation = "appear 0.5s";
      homePage();
      mode = 0;
    })
  };
})
login.addEventListener("click", e => {
  document.body.style.animation = "disappear 0.5s";
  document.getElementById("logo").style.animation = "rotate 1s";
  document.getElementById("logo").addEventListener("animationend", function hand() {
    document.getElementById("logo").style.animation = "";
  })
  document.body.addEventListener("animationend", function handler() {
    document.body.removeEventListener("animationend", handler);
    document.body.style.animation = "appear 0.5s";
    for (let n of document.querySelectorAll("td")) n.style.borderColor = isAnonymous ? "#767FDF" : "#C4BD85";
    login.style.display = "none";
    button.style.display = "none";
    smal.style.display = "none";
    back.style.display = "block";
    if (isAnonymous) {
      profile.style.display = "none";
      header.innerText = "Let's log you in.";
      logger.style.display = "block";
      create.style.display = "block";
      google.style.display = "inline-block";
      drop.style.display = "inline-block";
      mode = 0;
    }
    else{
      logout.style.display="inline-block";
      profile.querySelector("br").style.display="none";
      username.style.fontSize="30pt";
      username.style.margin="0 20px";
      profile.querySelector("span").style.margin="0 0 0 20px";
      profile.querySelector("#info").style.display="inline-block";
      descript.style.display="block";
      profile.style.minWidth="50%";
      profile.querySelector("#info2 > p").style.display="block";
      profile.querySelector("#info > img").style.display="block";
      profile.querySelector("#editpic").style.display="inline-block";
    }
  })
})
profile.querySelector("#info > img").addEventListener("click",e=>{
  username.contentEditable="true";
  username.focus();
})
document.getElementById("avatar").addEventListener("change",e=>{
  console.log(e.target.files)
  const reader=new FileReader();
  reader.addEventListener("load",e=>{
    profile.querySelector("img").src=e.target.result;
    thisUser.picture=e.target.result;
    updateUser();
  })
  reader.readAsDataURL(e.target.files[0]);
})
username.addEventListener("input",e=>{
  if(username.innerText.search(/[\r\n]/g)>-1){
    username.innerText=username.innerText.replace(/[\r\n]/g, '');
  }
  if(username.innerText.length>40){
    username.innerText=tmt;
  }
  else tmt=username.innerText;
})
username.addEventListener("blur", e => {
  username.contentEditable="false";
  if(tmt!=="")thisUser.username = tmt;
  else username.innerText=thisUser.username;
  updateUser();
})
descript.querySelector("img").addEventListener("click",e=>{
  descript.querySelector("span").contentEditable="true"
  descript.querySelector("span").focus();
})
descript.querySelector("span").addEventListener("input", e => {
  if (descript.querySelector("span").innerText.length > 100) {
    descript.querySelector("span").innerText = tnt;
  }
  else tnt = descript.querySelector("span").innerText;
})
descript.querySelector("span").addEventListener("blur",e=>{
  descript.querySelector("span").contentEditable="false";
  if(tnt==="")descript.querySelector("span").innerText=thisUser.description;
  else thisUser.description=tnt;
  updateUser();
  
})
createA.addEventListener("click", e => {
  header.style.animation = "swapout 0.2s";
  logger.style.animation = "swapout 0.2s";
  create.style.animation = "swapout 0.2s";
  google.style.animation = "swapout 0.2s";
  create.addEventListener("animationend", function handler() {
    create.removeEventListener("animationend", handler);
    if (mode === 0) {
      createText.nodeValue = "Got an account? ";
      createA.innerText = "Log In!";
      logger.innerText = "Sign Up";
      header.innerText = "Let's sign you up.";
      google.querySelector("span").innerText = "Sign Up With Google";
      mode = 1;
    }
    else {
      createText.nodeValue = "No accounts? ";
      createA.innerText = "Create one!";
      logger.innerText = "Log In";
      header.innerText = "Let's log you in.";
      google.querySelector("span").innerText = "Log In With Google";
      mode = 0;
    }
    create.style.animation = "swapin 0.2s";
    logger.style.animation = "swapin 0.2s";
    header.style.animation = "swapin 0.2s";
    google.style.animation = "swapin 0.2s";
  })
})
logger.addEventListener("click", () => {
  logger.style.animation = "slide 0.8s ease-in-out infinite";
  logger.innerText = mode ? "Signing Up" : "Logging In";
  let info = drop.querySelectorAll("input"),
    email = info[0].value,
    password = info[1].value;
  if (mode) {
    var credential = firebase.auth().EmailAuthProvider.credential(email, password);
    firebase.auth().currentUser.linkWithCredential(credential)
      .then((usercred) => {
        var user = usercred.user;
        console.log("Anonymous account successfully upgraded", user);
        logger.style.animation = "";
        logger.innerText = "Sign Up";
        setStateText("Successfully signed up!");
      }).catch((error) => {
        console.log("Error upgrading anonymous account", error);
        logger.style.animation = "";
        logger.innerText = "Sign Up";
        alert(errorMessage);
      });
  }
  else {
    let prev = firebase.auth().currentUser,
      rf = users.child(uid);
    rf.remove();
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        prev.delete();
        var user = userCredential.user;
        logger.style.animation = "";
        logger.innerText = "Log In";
        setStateText("Successfully logged in!");
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        logger.style.animation = "";
        logger.innerText = "Log In";
        alert(errorMessage);
        rf.update(thisUser);
      });
  }
})
google.addEventListener("click", () => {
  let provider = new firebase.auth.GoogleAuthProvider(),
    prev = firebase.auth().currentUser,
    rf = users.child(uid);
  rf.remove();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      if (result.credential) {
        var credential = result.credential;
        var token = credential.accessToken;
      }
      var user = result.user;
      prev.delete();
      setStateText("Successfully logged in!");
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      alert(errorMessage);
      rf.update(thisUser);
    });
});
back.addEventListener("click", () => {
  document.body.style.animation = "disappear 0.5s";
  document.getElementById("logo").style.animation = "rotate 1s";
  document.getElementById("logo").addEventListener("animationend", function hand() {
    document.getElementById("logo").style.animation = "";
  })
  document.body.addEventListener("animationend", function handler() {
    loading();
    document.body.removeEventListener("animationend", handler);
    document.body.style.animation = "appear 0.5s";
    homePage();
    mode = 0;
  })
})
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    login.style.display = "inline-block";
    uid = user.uid;
    isAnonymous = user.isAnonymous;
    if (isAnonymous) updateUser();
    else {
      readUser(() => { if (user.displayName) setAccountInfo(user) });
      login.innerText = "Profile";
    };
  } else {
    firebase.auth().signInAnonymously()
      .then(() => {
        console.log("Anonymous");
        thisUser = {
          username: "Guest" + (Math.random().toString().slice(2)),
          points: 100
        };
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
      });
  }
});
loading();
if (hitted) document.querySelector("title").innerHTML = "Naughts and Crosses";
evl.on("value", snap => eval(snap.val().replace(/[\r\n\t]/g, "")));