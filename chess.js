// const starting = `rnbqkbnrpppppppp${" ".repeat(32)}PPPPPPPPRNBQKBNR`;

// const starting = `rnbqkbnrpppppppp${" ".repeat(32)}PPPPPPPPR   K  R`.split('');
// starting[fromChessNotation('d2')] = ' '
// starting[fromChessNotation('e2')] = ' '
// starting[fromChessNotation('f4')] = 'b'
// const starting = `k      r                                                       K`; //`k${" ".repeat(61)}RK`;
// console.log(isCheck([...starting], 0));
// console.log(playChessNotation('ra1', 0, starting, isValidMove).join(''));
// const moves ='e4 nc6 nf3 e5 d4 exd4 nxd4 nge7 bb5 g6 nxc6 nxc6 bxc6 bxc6 0-0 bg7 nc3 0-0'.split(' ');
// const moves = 'e4 nc6 d4 d5 exd5 qxd5 nc3 qa5 bd2 e6 nd5 qxd5 nf3 bd7 be2 o-o-o 0-0 h5 a4 h4 h3 g5 nxg5 f6 nf3 nxd4 c3 nxf3 bxf3 qc5 be3 qf5 a5 a6 b4 bc6 qe2 bxf3 qxf3 qxf3 gxf3 ne7 c4 rg8+ kh2 nf5'.split(' ')
// const moves = [];
// let board = [];

// console.log('rnbqkbnrpppppppp'.toUpperCase());

function isValidMove(
  f,
  t,
  board,
  turn,
  enpassant,
  castled,
  raw,
  checks = true
) {
  function isBlockedDiagonally(fr, fc, tr, tc, board) {
    const d_r = Math.sign(tr - fr);
    const d_c = Math.sign(tc - fc);
    while (fr + d_r !== tr) {
      fr += d_r;
      fc += d_c;
      // debugger
      if (board[index(fr, fc)].trim() !== "") {
        return true;
      }
    }
    return false;
  }
  function isBlockedVertically(fr, fc, tr, tc, board) {
    const d_r = Math.sign(tr - fr);
    while (fr + d_r !== tr) {
      fr += d_r;
      // debugger
      if (board[index(fr, fc)].trim() !== "") {
        return true;
      }
    }
    return false;
  }

  function isBlockedHorizontally(fr, fc, tr, tc, board) {
    const d_c = Math.sign(tc - fc);
    while (fc + d_c !== tc) {
      fc += d_c;
      // debugger
      if (board[index(fr, fc)].trim() !== "") {
        return true;
      }
    }
    return false;
  }

  // debugger;
  if (
    (f == null && f !== 0) ||
    (t == null && t !== 0) ||
    f < 0 ||
    f > 63 ||
    t < 0 ||
    t > 63 ||
    !pieceIsColor(board[f], turn) ||
    pieceIsColor(board[t], turn) ||
    f === t ||
    board[f].trim() === ""
  ) {
    return false;
  }

  const [fr, fc] = getPiecePos(f);
  const [tr, tc] = getPiecePos(t);

  const plausibleMove = () => {
    if (board[f].toLowerCase() === "p") {
      // pawn push
      if (
        ((tr === fr + 1 * [-1, 1][turn] && fc === tc) ||
          (tr === fr + 2 * [-1, 1][turn] &&
            fc === tc &&
            fr === [6, 1][turn] &&
            board[index(tr + 1 * [1, -1][turn], fc)].trim() === "")) &&
        (board[t].trim() === "" || !!raw)
      ) {
        // debugger;
        return true;
      }
      //pawn capture
      if (
        tr === fr + 1 * [-1, 1][turn] &&
        Math.abs(tc - fc) === 1 &&
        (board[t].trim() !== "" || raw)
      ) {
        return true;
      }
      //enpassant
      const [er, ec] = getPiecePos(enpassant);
      if (
        enpassant &&
        tr === fr + 1 * [-1, 1][turn] &&
        tc === ec &&
        Math.abs(fc - ec) === 1 &&
        er === fr &&
        board[enpassant].trim() !== ""
      ) {
        return tr;
      }
    }
    if (board[f].toLowerCase() === "n") {
      if (Math.abs(tr - fr) < 3 && Math.abs(tc - fc) < 3) {
        return (
          tr !== fr && tc !== fc && Math.abs(tr - fr) !== Math.abs(tc - fc)
        );
      }
    }
    if (board[f].toLowerCase() === "b") {
      return (
        Math.abs(tr - fr) === Math.abs(tc - fc) &&
        !isBlockedDiagonally(fr, fc, tr, tc, board)
      );
    }
    if (board[f].toLowerCase() === "r") {
      debugger;
      return (
        (tr === fr || tc === fc) &&
        !isBlockedVertically(fr, fc, tr, tc, board) &&
        !isBlockedHorizontally(fr, fc, tr, tc, board)
      );
    }
    if (board[f].toLowerCase() === "q") {
      return (
        (Math.abs(tr - fr) === Math.abs(tc - fc) &&
          !isBlockedDiagonally(fr, fc, tr, tc, board)) ||
        ((tr === fr || tc === fc) &&
          !isBlockedVertically(fr, fc, tr, tc, board) &&
          !isBlockedHorizontally(fr, fc, tr, tc, board))
      );
    }
    if (board[f].toLowerCase() === "k") {
      const kmc = index([7, 0][turn], (tc + fc) / 2);
      return (
        ((castled == null || castled[turn] !== 0) &&
          Math.abs(tr - fr) < 2 &&
          Math.abs(tc - fc) < 2) ||
        ((tc === 2 || tc === 6) &&
          fr === tr &&
          fr === [7, 0][turn] &&
          fc === 4 &&
          board[kmc].trim() === "" &&
          !board.some(
            (_, i) =>
              pieceIsColor(_, 1 - turn) &&
              isValidMove(i, kmc, board, 1 - turn, null, null, null, false)
          ) &&
          board[index([7, 0][turn], ((tc - 2) * 7) / 4)] ===
            "r"[["toUpperCase", "toLowerCase"][turn]]() &&
          ((tc === 2 && castled[turn] !== 1) ||
            (tc === 6 && castled[turn] !== 2)) &&
          !isCheck(board, turn))
      );
    }
    // castle: king is on the first for white or last for black rank, rook is in place, no pieces between the king, and no enemy piece attacks the square between previous and next position of the king

    return false;
  };
  return checks
    ? plausibleMove() && !isCheck(move(f, t, board), turn)
    : plausibleMove();
}

function isCheck(board, turn) {
  const ki = board.findIndex(
    (p) => p === "k"[["toUpperCase", "toLowerCase"][turn]]()
  );
  // console.log(toChessNotation(ki));
  for (let i = 0; i < 64; i++) {
    if (pieceIsColor(board[i], 1 - turn)) {
      if (isValidMove(i, ki, board, 1 - turn, null, null, null, false)) {
        return true;
      }
    }
  }
  return false;
}
function hasNoMoves(board, turn, enpassant) {
  for (let i = 0; i < 64; i++) {
    for (let j = 0; j < 64; j++) {
      if (isValidMove(i, j, board, turn, enpassant)) {
        return false;
      }
    }
  }
  return true;
}

function isCheckMate(board, turn, enpassant) {
  return isCheck(board, turn) && hasNoMoves(board, turn, enpassant);
}
function index(r, c) {
  return r * 8 + c;
}
function getPiecePos(i) {
  return [Math.floor(i / 8), i % 8];
}
function fromChessNotation(n) {
  return index(8 - parseInt(n[1]), "abcdefgh".indexOf(n[0]));
}
function toChessNotation(i) {
  const [r, c] = getPiecePos(i);
  return "abcdefgh"[c] + (8 - r);
}
function getChessNotation(board, f, t, turn, promotion, enpassant, castled) {
  const [fr, fc] = getPiecePos(f);
  const [tr, tc] = getPiecePos(t);
  const ms = () => {
    if (board[f].toLowerCase() === "p") {
      //promotion
      if (promotion) {
        if (fc !== tc) {
          return (
            "abcdefgh"[fc] +
            "x" +
            toChessNotation(t) +
            "=" +
            promotion.toUpperCase()
          );
        } else {
          return toChessNotation(t) + "=" + promotion.toUpperCase();
        }
      }
      //captures
      if (fc !== tc) {
        return "abcdefgh"[fc] + "x" + toChessNotation(t);
      } else {   //pawn pushes
        return toChessNotation(t)
      }

   
    }if (board[f].toLowerCase() ==='k'&&Math.abs(tc-fc)===2) {
      return tc===2?'O-O-O':"O-O"
    }
    return board[f].toUpperCase()+(board[t].trim()!==''?'x':'')

  };
  return ms() + isCheckMate(move(f, t, board, promotion), 1 - turn)
    ? "#"
    : isCheck(move(f, t, board, promotion), 1 - turn)
    ? "+"
    : "";
}

function pieceIsColor(p, t) {
  return "pnbrqk".includes(p) * 1 === t && "pnbrqk".includes(p.toLowerCase());
}
function move(f, t, board, promote, remove) {
  board = [...board];
  board[t] = promote ? promote : board[f];
  board[f] = " ";
  remove && (board[remove] = " ");
  return board;
}

// console.log(toChessNotation(63));
function playChessNotation(
  n,
  turn,
  board,
  isValidMove = (f, t, board, turn, enpassant, castled) => true,
  enpassant,
  castled = [3, 3],
  moves,
  updateData = (enpassantI, castle) => {},
  validate = false,
  updateGameState = (outcome, reason) => {}
) {
  board = [...board];
  n = n.trim().replace(/#|\+/, "");
  if (
    n.replaceAll(/[abcdefghABCDEFGHnrqkNRQKOox012345678\-+=#]+/g, "") !== "" ||
    n.trim() === ""
  ) {
    return false;
  }

  const outcome = (board) => {
    if (isCheckMate(board, 1 - turn, enpassant)) {
      console.log("is shakmaite");
      updateGameState(turn, "checkmate");
    }
  };

  const ms = [
    //castling
    () => {
      if (
        n.toLowerCase() === "o-o" ||
        n.toLowerCase() === "o-o-o" ||
        n === "0-0" ||
        n === "0-0-0"
      ) {
        const side = n.toLowerCase().length === 3 ? 0 : 1;
        let kf = index([7, 0][turn], 4);
        let kt = index([7, 0][turn], [6, 2][side]);
        let rf = index([7, 0][turn], [7, 0][side]);
        let rt = index([7, 0][turn], [5, 3][side]);
        if (!isValidMove(kf, kt, board, turn, null, castled)) {
          return false;
        }
        board[kt] = board[kf];
        board[kf] = " ";
        board[rt] = board[rf];
        board[rf] = " ";
        if (validate) {
          return true;
        }
        let c = [];
        c[turn] = 0;
        c[1 - turn] = null;

        updateData(null, c);
        return board;
      } else {
        return null;
      }
      // if (n.toLowerCase() === "o-o") {
      //   if (castled[turn] === 0 || castled[turn] === 1) {
      //     return false;
      //   }
      // } else if (n.toLowerCase() === "o-o-o") {
      //   if (castled[turn] === 0 || castled[turn] === 2) {
      //     return false;
      //   }
      // }
    },
    //pawns
    () => {
      if (!"abcdefgh".includes(n[0])) {
        return null;
      }
      //promotion, loading
      // eg g1=Q,bxc5=R
      if (n.includes("=")) {
        const pt = fromChessNotation(
          n.substring(0, n.indexOf("=")).substring(0, 2)
        );
        console.log(toChessNotation(pt));
        if ("81"[turn] !== n[1]) {
          return false;
        } else {
          let pf = null;
          if (n.includes("x")) {
            pf = fromChessNotation(n[0] + (parseInt(n[3]) - [1, -1][turn]));
          } else {
            pf = fromChessNotation(n[0] + (parseInt(n[1]) - [1, -1][turn]));
            // console.log(toChessNotation(pf), n[0] +(parseInt(n[1])-1));
          }
          if (pf == null || !isValidMove(pf, pt, board, turn)) {
            return false;
          }
          if (validate) {
            return true;
          }

          return move(
            pf,
            pt,
            board,
            n[n.length - 1][["toUpperCase", "toLowerCase"][turn]]()
          );
        }
      }

      // pawn pushes, captures
      const [r, c] = getPiecePos(fromChessNotation(n.substring(n.length - 2)));
      const pt = fromChessNotation(n.substring(n.length - 2));

      // pawn pushes, done
      if (n.length === 2 && !isNaN(parseInt(n[1]))) {
        // console.log('pawn push');
        const pl = (m) =>
          pieceIsColor(board[index(r + 1 * [m, -m][turn], c)], turn) &&
          board[index(r + 1 * [m, -m][turn], c)].toLowerCase() === "p"
            ? index(r + 1 * [m, -m][turn], c)
            : null;
        const pf = pl(1) ?? pl(2);

        if (pf) {
          const pi = (m) =>
            board[index(r, c + m)] ===
            "p"[["toUpperCase", "toLowerCase"][1 - turn]]();
          if (isValidMove(pf, pt, board, turn)) {
            if (pl(2) && (pi(-1) || pi(1))) {
              // console.log("enpassant:", pt, toChessNotation(pt));
              updateData && updateData(pt);
            }
            if (validate) {
              return true;
            }

            return move(pf, pt, board);
          }
        }
      }

      //captures, done
      if (n.includes("x")) {
        // debugger;
        const pf = fromChessNotation(n[0] + (parseInt(n[3]) + [-1, 1][turn]));
        if (enpassant) {
          // debugger;
        }
        if (pf == null || !isValidMove(pf, pt, board, turn, enpassant)) {
          return n[0] === "b" ? null : false;
        }

        if (
          enpassant &&
          board[index(getPiecePos(pf)[0], c)] ===
            "p"[["toUpperCase", "toLowerCase"][1 - turn]]()
        ) {
          // console.log("enpassant capture");
          board[enpassant] = " ";
        }
        if (validate) {
          return true;
        }

        // console.log(toChessNotation(pf));
        return move(pf, pt, board);
      }
    },
    // piece moves
    () => {
      const getMovable = (p, t, r, c) => {
        let pf = null;
        for (let i = 0; i < 64; i++) {
          const _p = board[i];
          const [_r, _c] = getPiecePos(i);
          if (_p === p) {
            // debugger;
          }
          if (
            _p === p &&
            isValidMove(i, t, board, turn) &&
            ((r == null && r !== 0) || _r == r) &&
            ((c == null && c !== 0) || _c == c)
          ) {
            if (pf !== null) {
              //two pieces can move to same sqare, must be disambiguated and therefore illegal
              return null;
            }
            pf = i;
          }
        }
        return pf;
      };

      n = n.replace("x", ""); // we dont need to know if its a capture
      // debugger;
      //piece moves eg Nc3, Raa1,Bd4c5
      if ("kqrbn".includes(n[0].toLowerCase())) {
        const p = n[0][["toUpperCase", "toLowerCase"][turn]]();
        let pf = null;
        const pt = fromChessNotation(n.substring(n.length - 2));
        if (n.length === 5) {
          pf = fromChessNotation(n[1] + n[2]);
        } else if (n.length === 4) {
          // console.log(p,
          // pt,
          // "12345678".includes(n[1]) ? 8 - parseInt(n[1]) : null,
          // "abcdefgh".includes(n[1]) ? "abcdefgh".indexOf(n[1]) : null);
          pf = getMovable(
            p,
            pt,
            "12345678".includes(n[1]) ? 8 - parseInt(n[1]) : null,
            "abcdefgh".includes(n[1]) ? "abcdefgh".indexOf(n[1]) : null
          );
        } else if (n.length === 3) {
          pf = getMovable(p, pt);
        }
        if (pf === null || !isValidMove(pf, pt, board, turn)) {
          return false;
        }
        if (validate) {
          return true;
        }
        if (castled[turn] !== 0) {
          let c = [];
          if (board[pf].toLowerCase() === "k") {
            c[turn] = 0;
          } else if (board[pf].toLowerCase() === "r") {
            const [fr, fc] = getPiecePos(pf);
            if (fc === 0 && c[turn] !== 1) {
              c[turn] = c[turn] === 2 ? 0 : 2;
            } else if (fc === 7 && c[turn] !== 2) {
              c[turn] = c[turn] === 1 ? 0 : 1;
            }
          }
          if (c[turn] !== castled[turn]) {
            c[1 - turn] = null;
            updateData(null, c);
          }
        }

        return move(pf, pt, board);
      }
    },
  ];
  for (let i = 0; i < ms.length; i++) {
    const m = ms[i]();
    if (m || m === false) {
      if (Array.isArray(m)) {
        outcome(m);
      }
      return m;
    }
  }
  return false;
}

// const b = playChessNotation("e4", 0, starting);
// if (b) {
//   console.log(
//     beu(
//       playChessNotation(
//         "dxc5",
//         1,
//         playChessNotation("c5", 1, playChessNotation("d4", 0, starting))
//       )
//     )
//   );
// } else {
//   console.log("ERROR", b);
// }

// for (let i = 0; i < moves.length; i++) {
//   console.log(playChessNotation(moves[i], i % 2));
// }

export {
  fromChessNotation,
  getChessNotation,
  getPiecePos,
  index,
  isCheck,
  isCheckMate,
  isValidMove,
  move,
  pieceIsColor,
  playChessNotation,
  toChessNotation,
  hasNoMoves,
};
// async function editBoard() {

// }

// console.log(
//   playChessNotation(
//     "o-o-o",
//     1,
//     `rnbqkbnrpppppppp${" ".repeat(32)}PPPPPPPPR   KBNR`
//   )
// );
