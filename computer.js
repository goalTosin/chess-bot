import { pieceIsColor } from "./chess.js";

function basicEval(board) {
  const materialMultiplier = 1
  const evals = [];
  board.forEach((p) => {
    evals[pieceIsColor(p, 0) * 1] += [1, 3, 3, 5, 9, 1]["pnbrqk".indexOf(p.toLowerCase())] * materialMultiplier;
  });
  return evals;
}

function evaluate(board, turn, maxDepth, ) {
  
}
