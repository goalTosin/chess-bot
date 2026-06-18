function basicEval(board) {
  return [whiteBasicEval, blackBasicEval]
}

function evaluate(board, turn, options) {
  if (isForcingMove && options.calculateForcing) {
    return getForcingMoves()
      .map((move) => {
        return evaluate(makeMove(board, move), 1 - turn, options);
      })
      .reduce((a, b) => (a[turn] > b[turn] ? a : b));
  } else {
    return basicEval(board)
  }
}
