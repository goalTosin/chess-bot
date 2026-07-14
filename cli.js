import { existsSync, readFileSync, writeFileSync } from "fs";
import { ChessGame } from "./game.js";
import readline from "readline";
import { fromChessNotation } from "./chess.js";

function getInput() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function askQuestion(question, validate = () => true) {
  return new Promise((resolve) => {
    const rl = getInput();
    rl.question(question, (answer) => {
      rl.close();
      if (!validate(answer)) {
        resolve(askQuestion(question, validate));
      } else {
        resolve(answer);
      }
    });
  });
}

// async function live() {
//   process.addListener("exit", () =>
//     console.log("\nMoves played: ", moves.join(" "))
//   );

//   board = [...starting];
//   // moves.forEach(move => {
//   //   playChessNotation(move)
//   // });
//   // for (let i = 0; i < 64; i++) {
//   //   if (isValidMove(61,i, board, 0)) {
//   //     console.log(toChessNotation(i));
//   //   }
//   // }
//   let illegal = false;
//   const data = {
//     enpassant: null,
//     castled: [3, 3],
//   };
//   for (let i = 0; true; i++) {
//     console.log(beu(i % 2 === 0 ? board : [...board].reverse(), i % 2 === 1));
//     console.log();
//     let m;
//     if (i < moves.length) {
//       m = moves[i];
//       console.log(`${i % 2 === 0 ? "White" : "Black"} to play: ${m}`);
//     } else {
//       m = await askQuestion(
//         `${illegal ? "Illegal move. " : ""}${
//           i % 2 === 0 ? "White" : "Black"
//         } to play: `
//       );
//     }
//     const nb = playChessNotation(
//       m,
//       i % 2,
//       board,
//       (f, t, board, turn, enpassant, castled) =>
//         isValidMove(f, t, board, turn, enpassant, castled, false, moves),
//       data.enpassant,
//       data.castled,
//       null,
//       (enpassant, castle) => {
//         if (enpassant && enpassant !== -1) {
//           data.enpassant = enpassant;
//           console.log("date.enpassant is", data.enpassant);
//         }
//         if (castle) {
//           if (castle[0]) {
//             data.castled[0] = castle[0];
//           }
//           if (castle[1]) {
//             data.castled[1] = castle[1];
//           }
//         }
//       }
//     );
//     if (nb) {
//       board = [...nb];
//       moves.push(m);
//       illegal = false;
//     } else {
//       i--;
//       illegal = true;
//     }
//     console.log();
//   }
// }

function pause(s) {
  return new Promise((res, rej) => {
    setTimeout(res, s * 1000);
  });
}

async function welcome() {
  console.log(" === WELCOME TO CHESS_BOT === ");
  // await pause(1);
  console.log();
  console.log();
  console.log("Which of the following actions do you want to perform?");
  const actions = [
    { "Play Self": selfPlay },
    { "Over the board": overTheBoard },
    { "Edit Board": editPos },
  ];
  actions.forEach((ac, i) => {
    console.log("    " + (i + 1) + ". " + Object.keys(ac)[0]);
  });
  console.log();
  let fn = Object.values(
    actions[
      parseInt(
        await askQuestion("> ", (a) => parseInt(a) - 1 < actions.length)
      ) - 1
    ]
  )[0];
  // await pause(2);
  console.clear();

  fn();
}

async function overTheBoard() {
  const st = await askQuestion(
    "Starting position (enter for standard): ",
    (v) => {
      if (v === "") {
        return true;
      }
      for (let i = 0; i < v.length; i++) {
        if (!v.match(/[pnbrqkPNBRQK ]+/g)) {
          console.log("@" + v[i] + "@");
          return false;
        }
      }
      return true;
    }
  );
  const mo = await askQuestion("Moves played (enter for none): ");

  const game = new ChessGame(st.trim() === "" ? null : st.padEnd(64, " "));
  mo !== "" && game.playMoves(mo.trim().split(" "));
  process.addListener("exit", () => {
    // if (game.moves.length > 0) {
    //   if (unfinished !== -1) {
    //     gamesNotation.pop();
    //   }
    //   gamesNotation.push(
    //     `${game.moves.join(" ")}${game.status.outcome ? " 0-1" : " 1-0"}`
    //   );

    //   writeFileSync(
    //     "games/self.txt",
    //     gamesNotation.filter((g) => g.trim() !== "").join("\n")
    //   );
    //   console.log("Game saved");
    // }
    console.log("\nMoves played: ", game.moves.join(" "));
  });

  let illegal = false;
  let next = false;
  while (game.status.outcome === null || !next) {
    console.log();
    console.log(game.asciiRender(2));
    console.log();
    if (game.status.outcome !== null) {
      next = true;
      break;
    }
    const move = await askQuestion(
      `${illegal ? '"' + illegal + '" Illegal. ' : ""}${
        game.turn === 0 ? "White" : "Black"
      } to move: `
    );
    if (game.isValidMove(move)) {
      game.playMove(move);
      illegal = false;
    } else {
      illegal = move;
    }
  }
  console.log(`${game.outcome ? "Black" : "White"} wins by checkmate`);
}

async function selfPlay() {
  if (!existsSync("./games/self.txt")) {
    writeFileSync("./games/self.txt", "");
  }
  let a = 0;
  const gamesNotation = readFileSync("./games/self.txt").toString().split("\n");
  let unfinishedGames = gamesNotation
    .map((game, i) => {
      if (
        !game.endsWith("1-0") &&
        !game.endsWith("0-1") &&
        !game.endsWith("1/2-1/2") &&
        game.split(" ").length > 0 &&
        !game.trim().startsWith("#") &&
        game.trim() !== ""
      ) {
        return { g: game, i };
      }
    })
    .filter((g) => g != null);
  function save() {
    writeFileSync(
      "./games/self.txt",
      gamesNotation
        .map((g, i) => {
          const ug = unfinishedGames.find((v) => v.i === i);
          if (ug) {
            return ug.g;
          }
          return g;
        })
        .join("\n")
    );
    console.log("\nGames saved!\n");
  }
  process.addListener("exit", () => {
    save();
  });

  // console.log(unfinishedGames);
  while (unfinishedGames.length > 0) {
    let unfinished = Math.floor(Math.random() * unfinishedGames.length);
    console.log("\x1b[1mGame #" + (unfinished + 1 + "")+'\x1b[0m');
    const game = ChessGame.fromMoves(unfinishedGames[unfinished].g.split(" "));

    let illegal = false;
    let first = true;
    let b = false;
    // game.asciiRender(2)
    console.log(
      `\n${game.moves.join(' ')}\n\n${
        game.turn === 1 ? "White" : "Black"
      } played: ${game.moves.at(-1)}`
    );
    while (illegal || first || b) {
      first = false;
      const move = await askQuestion(
        `${illegal ? '"' + illegal + '" Illegal. ' : ""}${
          game.turn === 0 ? "White" : "Black"
        } to move${b?'':' (b to show board)'}: `
      );
      b = false
      if (move === 'b') {
        b=true
        console.log(`\n${game.asciiRender(2)}\n`);
      } else {
      if (game.isValidMove(move)) {
        game.playMove(move);
        unfinishedGames[unfinished].g = game.moves.join(" ");
        illegal = false;
        a++;
        if (a % 5 === 0) {
          save();
        }
      } else {
        illegal = move;
      }
      console.clear();

      }
    }
    if (game.status.outcome !== null) {
      gamesNotation[unfinishedGames[unfinished].i] = game.toCompact();

      console.log(
        game.outcome === 0.5
          ? "Draw by " + game.status.reason ?? "an unknown reason"
          : `${game.status.outcome ? "Black" : "White"} wins by ${
              game.status.reason
            }`
      );
      unfinishedGames.splice(unfinishedGames[unfinished].i, 1);
    }
  }
  console.log("You've completed the challenge!");
}

welcome();

async function editPos() {
  const st = await askQuestion(
    "Starting position (s for standard, enter for empty): ",
    (v) => {
      if (v === "") {
        return true;
      }
      for (let i = 0; i < v.length; i++) {
        if (!v.match(/[pnbrqkPNBRQK ]+/g)) {
          console.log("@" + v[i] + "@");
          return false;
        }
      }
      return true;
    }
  );

  const board =
    st === "s"
      ? `rnbqkbnrpppppppp${" ".repeat(32)}PPPPPPPPRNBQKBNR`
      : Array(64)
          .fill(null)
          .map((p) => " ");
  process.addListener("exit", () => {
    console.log("\n@" + board.join("") + "@");
  });
  const asciiRender = (side) => {
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
                  return p === " " ? l.repeat(2) : m[p] + " ";
                })
                .join("")
          )
          .join("\n") +
        "\n  " +
        (r ? "H G F E D C B A" : "A B C D E F G H")
      );
    };

    return beu(board, side);
  };
  let s = 0;
  while (true) {
    console.log();
    console.log(asciiRender(s));
    console.log();
    const edit = await askQuestion("> ");
    if (edit === "flip") {
      s = 1 - s;
    }
    if ("abcdefgh".includes(edit[0].toLowerCase()) && edit.length === 2) {
      board[fromChessNotation(edit)] = " ";
    }
    if ("pnbrqk".includes(edit[0].toLowerCase())) {
      board[fromChessNotation(edit.substring(1))] = edit[0];
    }
  }
}

async function rando() {
  const game = new ChessGame();
  const ans = await askQuestion("Play as [W]hite or [B]lack: ", (v) =>
    "wb ".includes(v.toLowerCase())
  );
  const side =
    ans.toLowerCase() === "w" ? 0 : ans.toLowerCase() === "b" ? 1 : 0;

  let illegal = false;
  let next = false;
  while (game.status.outcome === null || !next) {
    if (side === game.turn) {
      game.playMove(randItem(getAllMoves()));
    }
    console.log();
    console.log(game.asciiRender(2));
    console.log();
    if (game.status.outcome !== null) {
      next = true;
      break;
    }
    const move = await askQuestion(
      `${illegal ? '"' + illegal + '" Illegal. ' : ""}${
        game.turn === 0 ? "White" : "Black"
      } to move: `
    );
    if (game.isValidMove(move)) {
      game.playMove(move);
      illegal = false;
    } else {
      illegal = move;
    }
  }
  console.log(`${game.outcome ? "Black" : "White"} wins by checkmate`);
}
