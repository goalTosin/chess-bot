import {
  getMoveNotation,
  getPiecePos,
  index,
  isValidMove,
  toChessNotation,
} from "../chess.js";
import { ChessGame } from "../game.js";
import { wrap } from "../utils.js";

const boardE = document.querySelector(".board");
let game = new ChessGame();
let toMove = null;
let white_side = true;
function clickTile(ii) {
  const i = white_side ? ii : 63 - ii;
  if (toMove === null) {
    if (game.board[i].trim() !== "") {
      toMove = i;
    }
  } else {
    if (
      isValidMove(
        toMove,
        i,
        game.board,
        game.turn,
        game.state.enpassant,
        game.state.castle
      )
    ) {
      game.playMove(
        getMoveNotation(game.board, toMove, i, game.turn, false, isValidMove)
      );
      toMove = null;
    } else if (toMove === i) {
      toMove = null;
    } else {
      toMove = null;
      clickTile(ii);
    }
  }
}
const dragging = {
  start: null,
  on: false,
};
for (let i = 0; i < 64; i++) {
  const [r, c] = getPiecePos(i);
  const tile = document.createElement("div");
  tile.classList.add("tile");
  (r + c) % 2 === 1 && tile.classList.add("dark");
  const info = document.createElement("div");
  info.classList.add("info");
  const drop = document.createElement("div");
  drop.classList.add("drop");
  // tile.innerHTML = game.board[i]
  tile.addEventListener("mousedown", (e) => {
    dragging.start = i;
  });
  tile.appendChild(drop);
  tile.appendChild(info);
  boardE.appendChild(tile);
}
window.addEventListener("mousemove", (e) => {
  if (dragging.start !== null) {
    const info = boardE.children[dragging.start].querySelector(".info");
    if (!dragging.on) {
      console.log("drag start");
      if (dragging.start !== toMove) {
        clickTile(dragging.start);
      }
      dragging.offx = info.offsetLeft + info.offsetWidth / 2;
      dragging.offy = info.offsetTop + info.offsetHeight / 2;
      updateBoard();

      dragging.on = true;
    } else {
      // console.log("dragging");
      info.classList.add("drag");
      info.style.setProperty("--x", e.clientX - dragging.offx + "px");
      info.style.setProperty("--y", e.clientY - dragging.offy + "px");
    }
  }
});
window.addEventListener("mouseup", (e) => {
  if (dragging.start !== null) {
    const info = boardE.children[dragging.start].querySelector(".info");
    if (dragging.on) {
      info && info.classList.remove("drag");
      dragging.on = false;
      const t = wrap(
        (i) => (white_side ? i : 63 - i),
        index(
          Math.floor(
            ((e.clientY - boardE.offsetTop) / boardE.offsetHeight) * 8
          ),
          Math.floor(
            ((e.clientX - boardE.offsetLeft) / boardE.offsetWidth) * 8
          )

        )
      )
      console.log("d end of drag,",toChessNotation(t));
      clickTile(
        t
      );
    } else {
      console.log("clicking tile " + dragging.start, dragging.start);
      clickTile(dragging.start);
      updateBoard();
    }
    dragging.start = null;

    updateBoard();
  }
});

updateBoard();

function updateBoard() {
  for (let i = 0; i < 64; i++) {
    const s = boardE.children[i].querySelector(".info");
    const b = boardE.children[i].querySelector(".drop");
    s.className = [...s.classList].filter((p) => !p.match(/(w|b)[pnbrqk]/));

    if (game.board[white_side ? i : 63 - i].trim() !== "") {
      s.classList.add(
        (game.board[white_side ? i : 63 - i].toLowerCase() ===
        game.board[white_side ? i : 63 - i]
          ? "b"
          : "w") + game.board[white_side ? i : 63 - i].toLowerCase()
      );
    }
    if ((white_side ? i : 63 - i) === toMove) {
      b.classList.add("toMove");
    } else {
      if (b.classList.contains("toMove")) {
        b.classList.remove("toMove");
      }
    }
  }
}

addEventListener("keydown", (e) => {
  if (e.code === "KeyF") {
    white_side = !white_side;
    updateBoard();
    // console.log('done');
  }
});
