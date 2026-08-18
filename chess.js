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
        (tr === fr + 1 * [-1, 1][turn] ||
          (tr === fr + 2 * [-1, 1][turn] &&
            fr === [6, 1][turn] &&
            board[index(fr + 1 * [-1, 1][turn], fc)].trim() === "")) &&
        (board[t].trim() === "" || !!raw) &&
        fc === tc
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
        Math.abs(tc - fc) === 1 &&
        Math.abs(fc - ec) === 1 &&
        fr === er &&
        tc === ec &&
        board[enpassant].toLowerCase() === "p" &&
        pieceIsColor(board[enpassant], 1 - turn)
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
      // debugger;
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
        (Math.abs(tr - fr) < 2 && Math.abs(tc - fc) < 2) ||
        ((castled == null || castled[turn] !== 0) &&
          (tc === 2 || tc === 6) &&
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
          ((tc === 2 && (castled == null || castled[turn] !== 1)) ||
            (tc === 6 && (castled == null || castled[turn] !== 2))) &&
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
function getMoveNotation(
  board,
  f,
  t,
  turn,
  promotion,
  isValidMove = (f, t, board, turn, enpassant) => true,
  enpassant
) {
  const [fr, fc] = getPiecePos(f);
  const [tr, tc] = getPiecePos(t);
  const ms = () => {
    if (board[f].toLowerCase() === "p") {
      //promotion
      if (
        typeof promotion === "string" &&
        "qrbn".includes(promotion.toLowerCase())
      ) {
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
      } else {
        //pawn pushes
        return toChessNotation(t);
      }
    }
    if (board[f].toLowerCase() === "k" && Math.abs(tc - fc) === 2) {
      return tc === 2 ? "O-O-O" : "O-O";
    }
    //   let c =0
    // for (let i = 0; i < board.length; i++) {
    //   const p = board[i];
    //   if (p.toLowerCase() === board[f].toLowerCase() && pieceIsColor(p, turn)) {
    //     isValidMove()
    //   }
    // }
    let fn = toChessNotation(f);
    let disambiguation = [];
    let n = false;
    for (let i = 0; i < board.length; i++) {
      const p = board[i];
      if (
        p.toLowerCase() === board[f].toLowerCase() &&
        pieceIsColor(p, turn) &&
        isValidMove(i, t, board, turn) &&
        i !== f
      ) {
        let [r, c] = getPiecePos(i);
        if (r === fr) {
          disambiguation[0] = fn[0];
        } else if (c === fc) {
          disambiguation[1] = fn[1];
        }
        n = true;
        // console.log(toChessNotation(i));
      }
    }
    if (n && disambiguation.length === 0) {
      disambiguation[0] = fn[0];
    }
    return (
      board[f].toUpperCase() +
      disambiguation.join("") +
      (board[t].trim() !== "" ? "x" : "") +
      toChessNotation(t)
    );
  };
  return (
    ms() +
    (isCheckMate(move(f, t, board, promotion), 1 - turn)
      ? "#"
      : isCheck(move(f, t, board, promotion), 1 - turn)
      ? "+"
      : "")
  );
}

function pieceIsColor(p, t) {
  return "pnbrqk".includes(p.toLowerCase()) && "pnbrqk".includes(p) * 1 === t;
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
  {
    isValidMove = (f, t, board, turn, enpassant, castled) => true,
    enpassant,
    castled = [3, 3],
    moves,
    updateData = (enpassantI, castle) => {},
    validate = false,
    updateGameState = (outcome, reason) => {},
    returnMove = false,
  } = {}
) {
  // debugger;
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
      // console.log("is shakmaite");
      updateGameState(turn, "checkmate");
    } else if (hasNoMoves(board, 1 - turn, enpassant)) {
      updateGameState(0.5, "stalemate");
    } else if (isDrawByInsufficientMaterial(board)) {
      updateGameState(0.5, "insufficient checkmating material");
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
        const side = n.length === 3 ? 0 : 1;
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
        return { board, move: n.length === 3 ? "O-O" : "O-O-O" };
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
      // debugger;

      //promotion, loading
      // eg g1=Q,bxc5=R
      if (n.includes("=")) {
        const pt = fromChessNotation(
          n.length === 4 ? n[0] + n[1] : n[2] + n[3]
        );
        // console.log(toChessNotation(pt));
        if ("81"[turn] !== n[n.length === 4 ? 1 : 3]) {
          // console.log('here');
          return false;
        } else {
          let pf = null;
          if (n.includes("x")) {
            pf = fromChessNotation(n[0] + (parseInt(n[3]) - [1, -1][turn]));
          } else {
            pf = fromChessNotation(n[0] + (parseInt(n[1]) - [1, -1][turn]));
            // console.log(toChessNotation(pf), n[0] +(parseInt(n[1])-1));
          }
          // debugger;

          if (pf == null || !isValidMove(pf, pt, board, turn)||board[pf].toLowerCase() !== 'p') {
            return false;
          }

          if (validate) {
            return true;
          }

          return {
            board: move(
              pf,
              pt,
              board,
              n[n.length - 1][["toUpperCase", "toLowerCase"][turn]]()
            ),
            move: returnMove
              ? getMoveNotation(
                  board,
                  pf,
                  pt,
                  turn,
                  n[n.length - 1][["toUpperCase", "toLowerCase"][turn]](),
                  isValidMove,
                  enpassant
                )
              : n,
          };
        }
      }

      // pawn pushes, captures
      const [r, c] = getPiecePos(fromChessNotation(n.substring(n.length - 2)));
      const pt = fromChessNotation(n.substring(n.length - 2));

      // pawn pushes, done
      if (n.length === 2 && !isNaN(parseInt(n[1]))) {
        // console.log('pawn push');
        const pl = (m) => {
          const k = index(r + 1 * [m, -m][turn], c);
          return pieceIsColor(board[k], turn) && board[k].toLowerCase() === "p"
            ? k
            : null;
        };
        const pf = pl(1) ?? pl(2);

        if (pf && board[pf].toLowerCase() === 'p') {
          const pi = (m) =>
            board[index(r, c + m)] ===
            "p"[["toUpperCase", "toLowerCase"][1 - turn]]();
          if (isValidMove(pf, pt, board, turn)) {
            if (pl(2)) {
              // console.log("enpassant:", pt, toChessNotation(pt));
              updateData && updateData(pt);
            }
            if (validate) {
              return true;
            }

            return {
              board: move(pf, pt, board),
              move: returnMove
                ? getMoveNotation(
                    board,
                    pf,
                    pt,
                    turn,
                    null,
                    isValidMove,
                    enpassant
                  )
                : n,
            };
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
        if (
          pf == null ||
          isNaN(pf) ||
          !isValidMove(pf, pt, board, turn, enpassant)||board[pf].toLowerCase() !== 'p'
        ) {
          return n[0] === "b" // may be a bishop
            ? null
            : false;
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
        return {
          board: move(pf, pt, board),
          move: returnMove
            ? getMoveNotation(board, pf, pt, turn, null, isValidMove, enpassant)
            : n,
        };
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

      n = n.replace("x", ""); // we dont need to know whether its a capture
      // debugger;
      //piece moves eg Nc3, Raa1,Bd4c5
      if ("kqrbn".includes(n[0].toLowerCase()) && n.length > 2) {
        const p = n[0][["toUpperCase", "toLowerCase"][turn]]();
        let pf = null;
        const pt = fromChessNotation(n.substring(n.length - 2));
        if (isNaN(pt)) {
          return false;
        }
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
          // debugger;
          pf = getMovable(p, pt);
        }
        // debugger;
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
        // console.log(
        //   "The move: " +
        //     getMoveNotation(board, pf, pt, turn, null, isValidMove, enpassant)
        // );

        return {
          board: move(pf, pt, board),
          move: returnMove
            ? getMoveNotation(board, pf, pt, turn, null, isValidMove, enpassant)
            : n,
        };
      }
    },
  ];
  for (let i = 0; i < ms.length; i++) {
    try {
      const m = ms[i]();
      if (m || m === false) {
        if (m && m.board && Array.isArray(m.board)) {
          outcome(m.board);
        }
        return m;
      }
    } catch (err) {
      return false;
    }
  }
  return false;
}

function generateLegalMoves(board, turn, enpassant, castled) {
  const moves = [];
  for (let i = 0; i < 64; i++) {
    const pf = board[i];
    if (pieceIsColor(board[i], turn) && board[i].toLowerCase() === "k") {
      // debugger;
    }
    for (let j = 0; j < 64; j++) {
      if (
        pieceIsColor(board[i], turn) &&
        !(
          board[i].toLowerCase() === "p" &&
          ((j < 8 && pieceIsColor(pf, 0)) || (j > 55 && pieceIsColor(pf, 1)))
        ) &&
        isValidMove(i, j, board, turn, enpassant, castled)
      ) {
        moves.push(getMoveNotation(board, i, j, turn, null, isValidMove));
      }
      // if (pieceIsColor(board[i], turn) && board[i].toLowerCase() === "k") {
      //   debugger;
      // }
    }
  }
  //promotions
  for (let i = 0; i < 64; i++) {
    const p = board[i];
    const [fr, fc] = getPiecePos(i);
    if (
      p.toLowerCase() === "p" &&
      ((fr === 6 && pieceIsColor(p, 1)) || (fr === 1 && pieceIsColor(p, 0)))
    ) {
      for (let c = -1; c < 2; c++) {
        const t = index(fr + 1 * [-1, 1][turn], fc + c);
        if (isValidMove(i, t, board, turn)) {
          moves.push(
            ...[..."QRBN"].map((p) => getMoveNotation(board, i, t, turn, p))
          );
        }
      }
    }
  }
  return moves;
}

function isRearranged(arr1, arr2) {
  arr1 = [...arr1];
  arr2 = [...arr2];
  return (
    arr1.every((v) => arr2.includes(v)) &&
    arr2.every((v) => arr1.includes(v)) &&
    arr1.length === arr2.length
  );
}

function isDrawByInsufficientMaterial(board) {
  const pieces = board.filter((p) => p.trim() !== "");
  if (pieces.length === 2) {
    return true;
  }
  const nonKingPieces = pieces.filter((p) => p.toLowerCase() !== "k");
  if (
    isRearranged(nonKingPieces, "bB") || // 2 opposing bishops
    isRearranged(nonKingPieces, "nN") || // 2 opposing knights
    isRearranged(nonKingPieces, "nB") || // black knight and white bishop
    isRearranged(nonKingPieces, "Nb") || // white knight and black bishop
    isRearranged(nonKingPieces, "b") || // a black bishop
    isRearranged(nonKingPieces, "B") || // a white bishop
    isRearranged(nonKingPieces, "n") || // a black knight
    isRearranged(nonKingPieces, "N") // a white knight
  ) {
    return true;
  }
  return false;
}

function toFen(board, turn, enpassant, castle, halfClockMoves, fullMoves) {
  let f = "";
  let sp = 0;
  board.forEach((p, i) => {
    if (p.trim() !== "") {
      f += p;
    } else {
      sp++;
      if (board[i + 1].trim() !== "") {
        f += sp;
      }
      sp = 0;
    }
    if (i % 8 === 0 && i < 63) {
      f += "/";
    }
  });
  // enpassant&&enpassant>=0&&(f[enpassant] = '-')
  const c = (i) =>
    (castle[i] === 0
      ? ""
      : castle[i] === 1
      ? "Q"
      : castle[i] === 2
      ? "K"
      : "QK")[["toUpperCase", "toLowerCase"][i]]();
  return `${f} ${turn === 0 ? "w" : "b"} ${
    c(0) + c(1) === "" ? "-" : c(0) + c(1)
  } ${
    enpassant && enpassant >= 0 ? toChessNotation(enpassant) : "-"
  } ${fullMoves} ${halfClockMoves}`;
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
  generateLegalMoves,
  getMoveNotation,
  getPiecePos,
  index,
  isCheck,
  isCheckMate,
  isDrawByInsufficientMaterial,
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
