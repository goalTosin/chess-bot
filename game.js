import {
  generateLegalMoves,
  isValidMove,
  pieceIsColor,
  playChessNotation,
} from "./chess.js";

class ChessGame {
  constructor(starting) {
    this.board = starting
      ? [...starting]
      : [...`rnbqkbnrpppppppp${" ".repeat(32)}PPPPPPPPRNBQKBNR`];
    this.state = {
      enpassant: null,
      castle: [3, 3],
      halfMoves: 0,
    };
    this.moves = [];
    this.status = { outcome: null, reason: null };
  }
  get turn() {
    return this.moves.length % 2;
  }
  isValidMove(notation) {
    return this.status.outcome === null
      ? playChessNotation(notation, this.turn, this.board, {
          isValidMove,
          enpassant: this.state.enpassant,
          castle: this.state.castle,
          validate: true,
        })
      : false;
  }
  setStatus(outcome, reason) {
    this.status.outcome = outcome;
    this.status.reason = reason;
  }
  playMove(notation, san=true) {
    const nb = playChessNotation(notation, this.moves.length % 2, this.board, {
      isValidMove: isValidMove,
      enpassant: this.state.enpassant,
      castle: this.state.castle,
      updateData: (enpassant, castle) => {
        if (enpassant && enpassant !== -1) {
          this.state.enpassant = enpassant;
          // console.log("date.enpassant is", data.enpassant);
        }
        if (castle) {
          if (castle[0] != null || castle[0] === 0) {
            this.state.castle[0] = castle[0];
          }
          if (castle[1] != null || castle[1] === 0) {
            this.state.castle[1] = castle[1];
          }
        }
      },
      updateGameState: this.setStatus.bind(this),
      returnMove: san,
      
    });
    if (nb) {
      this.board = nb.board;
      this.moves.push(nb.move);
      if (nb.move.includes("x")) {
        this.state.halfMoves = 0;
      } else {
        this.state.halfMoves+=1;
        // console.log(this.state.halfMoves);
      }
      if (this.state.halfMoves  === 100) {
        this.setStatus(0.5, '50-move rule')
      }
    } else {
      if (nb === false) {
        throw new Error('Hell! @' + notation+'@')
      }
    }
    return this;
  }
  asciiRender(side) {
    const m = {
      P: "♟",
      N: "♞",
      B: "♝",
      R: "♜",
      Q: "♛",
      K: "♚",
      p: "♙",
      n: "♘",
      b: "♗",
      r: "♖",
      q: "♕",
      k: "♔",
      " ": " ",
    };

    const beu = (s, r) => {
      r && (s = [...s].reverse());
      return (
        [
          s.slice(0, 8),
          s.slice(8, 16),
          s.slice(16, 24),
          s.slice(24, 32),
          s.slice(32, 40),
          s.slice(40, 48),
          s.slice(48, 56),
          s.slice(56, 64),
        ]
          .map(
            (p, i) =>
              (r ? i + 1 : 8 - i) +
              " " +
              p
                .map((p, j) => {
                  const ls = (i + j) % 2 === 0;
                  let l = ls ? "\x1b[47m" : "";
                  let pc = pieceIsColor(p, 0) ? "\x1b[36m" : "\x1b[32m";
                  return l + pc + m[p.toUpperCase()] + " \x1b[0m";
                })
                .join("")
          )
          .join("\n") +
        "\n  " +
        (r ? "H G F E D C B A" : "A B C D E F G H")
      );
    };

    return beu(this.board, side === 2 ? this.moves.length % 2 : side);
  }

  generateLegalMoves() {
    return generateLegalMoves(
      this.board,
      this.turn,
      this.state.enpassant,
      this.state.castle
    );
  }
  toCompact() {
    return (
      this.moves.join(" ") +
      (this.status.outcome === 0.5
        ? " 1/2-1/2"
        : this.status.outcome
        ? " 0-1"
        : " 1-0")
    );
  }
  toPGN() {
    return (
      this.moves
        .map((m, i) => (i % 2 === 0 ? i / 2 + 1 + "." : "") + " " + m + " ")
        .join(" ") +
      (this.status.outcome === 0.5
        ? "1/2-1/2"
        : this.status.outcome
        ? " 0-1"
        : " 1-0")
    );
  }
  playMoves(moves) {
    moves.forEach((m, i) => {
      this.playMove(m, true);
    });
    return this;
  }
  static fromMoves(moves) {
    const g = new ChessGame();
    moves.forEach((m, i) => {
      g.playMove(m, true);
    });
    return g;
  }
  clone() {
    return new ChessGame().copy(this)
  }
  copy(game) {
    this.board = [...game.board]
    this.moves = [...game.moves]
    this.state = {...game.state}
    this.status = {...game.status}

    return this
  }
}

export { ChessGame };
