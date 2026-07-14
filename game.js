import { isValidMove, playChessNotation } from "./chess.js";

class ChessGame {
  constructor(starting) {
    this.board = starting
      ? [...starting]
      : [...`rnbqkbnrpppppppp${" ".repeat(32)}PPPPPPPPRNBQKBNR`];
    this.state = {
      enpassant: null,
      castle: [3, 3],
    };
    this.moves = [];
    this.status = { outcome: null, reason: null };
  }
  get turn() {
    return this.moves.length % 2;
  }
  isValidMove(notation) {
    return this.status.outcome === null
      ? playChessNotation(
          notation,
          this.turn,
          this.board,
          isValidMove,
          this.state.enpassant,
          this.state.castle,
          null,
          null,
          true
        )
      : false;
  }
  setStatus(outcome, reason) {
    this.status.outcome = outcome;
    this.status.reason = reason;
  }
  playMove(notation) {
    const nb = playChessNotation(
      notation,
      this.moves.length % 2,
      this.board,
      isValidMove,
      this.state.enpassant,
      this.state.castle,
      null,
      (enpassant, castle) => {
        if (enpassant && enpassant !== -1) {
          this.state.enpassant = enpassant;
          // console.log("date.enpassant is", data.enpassant);
        }
        if (castle) {
          if (castle[0] !== null) {
            this.state.castle[0] = castle[0];
          }
          if (castle[1] !== null) {
            this.state.castle[1] = castle[1];
          }
        }
      },
      false,
      this.setStatus.bind(this)
    );
    if (nb) {
      this.board = nb;
      this.moves.push(notation);
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
                  let l = (i + j) % 2 === 0 ? "\u2588" : "\u2591";
                  return p === " " ? l + l : m[p] + " ";
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
  toCompact() {
    return (
      this.moves.join(" ") +
      (this.status.outcome === 0.5
        ? "1/2-1/2"
        : this.status.outcome
        ? " 0-1"
        : " 1-0")
    );
  }
  playMoves(moves) {
    moves.forEach((m, i) => {
      this.playMove(m);
    });
  }
  static fromMoves(moves) {
    const g = new ChessGame();
    moves.forEach((m, i) => {
      g.playMove(m);
    });
    return g;
  }
}

export { ChessGame };
