// const { Chess, Move } = require("chess.js");
// const fs = require("fs");
import fs from "fs";
import { NeuralNetwork } from "./ai.js";
import { ChessGame } from "../game.js";
import { randItem, wrap } from "../utils.js";
import readline from "readline";

// 2. Board encoding (white's perspective, a8=0, h1=63)
// ----------------------------------------------------------------------
const PIECE_VALUES = {
  p: 1,
  n: 2,
  b: 3,
  r: 4,
  q: 5,
  k: 6,
  " ": 0,
};

function boardToInput(board) {
  return board.map(
    (p) => (p.toUpperCase() === p ? 1 : -1) * PIECE_VALUES[p.toLowerCase()]
  );
}

// ----------------------------------------------------------------------
// 4. Self-play episode
// ----------------------------------------------------------------------
function selfPlayEpisode(net, epsilon) {
  const game = new ChessGame();
  const history = []; // { fen, turn } to store positions from white's view
  /**
   * @type {Move[]}
   */
  while (game.status.outcome === null) {
    const input = boardToInput(game.board);
    // console.log(input);
    const turn = game.turn; // 'w' or 'b'

    // Store state before move (we'll train later with final outcome)
    history.push({ input, turn });

    const moves = game.generateLegalMoves();
    // console.clear()
    // console.log(game.asciiRender(2),moves, Math.random() < 0.5 && moves.length > 200?game.state.halfMoves:'');
    if (moves.length === 0) break;

    let chosenMove;
    if (Math.random() < epsilon) {
      // Random move (exploration)
      chosenMove = randItem(moves);
    } else {
      // Greedy: evaluate all moves and pick best according to turn
      chosenMove = randItem(
        moves
          .map((move) => {
            // console.log(move);
            return [
              (turn * 2 - 1) *
                net.forward(
                  wrap(
                    (b) => (turn === 0 ? b : b.reverse()),
                    boardToInput(game.clone().playMove(move).board)
                  )
                ),
              move,
            ];
          })
          .sort((a, b) => (turn === 0 ? b[0] - a[0] : a[0] - b[0]))
          .slice(0, 3) //top three moves
          .filter((v, i) => i === 0 || (game.turn === 0 ? v[0] > 0 : v[0] < 0)) //best moves that are not losing
      )[1];
    }
    try {
      game.playMove(chosenMove);
    } catch (error) {
      console.log(game);
      throw new Error(error);
    }
  }

  // Return training data: all positions with target = outcome
  if (game.status.outcome !== 0.5) {
    fs.appendFileSync("ai/data/games.txt", game.toCompact() + "\n");
  }
  // console.log(history);
  return history.map((h, i) => ({
    input: h.turn === 0 ? h.input : [...h.input].reverse(),
    target: game.status.outcome * 2 - 1, //* (i / history.length) ** 2, // because net always evaluates white's chance
  }));
}

// ----------------------------------------------------------------------
// 5. Training loop with saving
// ----------------------------------------------------------------------
const WEIGHTS_FILE = "ai/data/chess_weights.json";
const INITIAL_EPSILON = 0.2;
const EPSILON_DECAY = 0.99997; // reduce exploration per game
const LEARNING_RATE = 0.0001;
const LAYER_SIZES = [64, 256, 256, 1]; // input, hidden, hidden, output

// Main training
let episode = 0;
let epsilon = INITIAL_EPSILON;
/**
 * @type {NeuralNetwork}
 */
let net;
if (fs.existsSync(WEIGHTS_FILE)) {
  console.log("Loading saved weights...");
  const data = JSON.parse(fs.readFileSync(WEIGHTS_FILE, "utf8"));
  net = NeuralNetwork.fromJSON(data.net, LEARNING_RATE);
  episode = data.episode;
  epsilon = data.epsilon;
} else {
  console.log("Creating new network...");
  net = new NeuralNetwork(LAYER_SIZES, LEARNING_RATE);
}

// Save weights on exit (Ctrl+C)
function save() {
  // console.log("\nSaving weights...");
  fs.writeFileSync(
    WEIGHTS_FILE,
    JSON.stringify({ net: net.toJSON(), episode, epsilon }, null, 2)
  );
}

let times = [Date.now(), 0, 0, 0, 0];
let graph = [0,0,0,0,0,0,0,0]


function trainStep() {
  episode++;
  epsilon *= EPSILON_DECAY;

  // Play one game
  const trainingData = selfPlayEpisode(net, epsilon);
  // console.log(trainingData);

  // Train on this game's data
  net.trainBatch(trainingData);
  if (times[1] === 0) {
    times[1] = Date.now() - times[0]
  } else  {
    times[1] = Math.min(Date.now() - times[0], times[1])

  }
  if (times[2] === 0) {
    times[2] = Date.now() - times[0]
  } else  {
    times[2] = Math.max(Date.now() - times[0], times[2])

  }
  times[4]+=1
  console.clear()
  const tt = Date.now() - times[0]
  if (times[3] === 0) {
    times[3] = tt
  } else {
    times[3] = ((times[3])*(times[4]-1)+tt)/times[4]
  }
  graph.shift()
  graph.push(tt)

  console.log(`\x1b[1mTraining...\x1b[0m\n`); 
  console.log(`  Total episodes: ${episode}`);
  console.log(`  Epsillon: ${epsilon.toFixed(4)}`);
  console.log(`  Last episode sample count: ${trainingData.length}`);
  console.log(`  Min episode time: ${times[1]??'unknown'}`);
  console.log(`  Max episode time: ${times[2]??'unknown'}`);
  console.log(`\n         1         1000ms    2000ms    3000ms    4000ms    5000ms`);
  console.log(`Average: ${'#'.repeat(Math.round(times[3]/5000*50))}#${' '.repeat(Math.max(0,50-Math.round(times[3]/5000*50)))}(${times[3].toFixed(1)}ms)`);
  graph.forEach(g => {
    console.log(`Time:    ${'#'.repeat(Math.round(g/5000*50))} ${' '.repeat(Math.max(0,50-Math.round(g/5000*50)))}(${g}ms)`);
  })

  

  // Log progress
  // if (episode % 1 === 0) {
  //   console.log(
  //     `Episode ${episode}, epsilon ${epsilon.toFixed(4)}, samples ${
  //       trainingData.length
  //     }, took ${Date.now() - lt}ms`
  //   );
  //   lt = Date.now();
  // }

  // // Save periodically (every 100 episodes)
  // if (episode % 10 === 0) {
  //   console.log(`Ten episodes took exactly ${Date.now() - ltt}ms\n`);
  //   ltt = Date.now();
  // }
  // Save periodically (every 100 episodes)
  if (episode % 50 === 0) {
    save();
  }

  // if (episode % 100 === 0) {
    // console.log(
    //   `Weights saved at episode ${episode}, took ${Date.now() - ltb}ms`
    // );
    // ltb = Date.now();
  // }
  times[0] = Date.now()
  // Continue indefinitely
  setImmediate(trainStep);
}

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

// ----------------------------------------------------------------------
// 6. (Optional) Play against the AI
// ----------------------------------------------------------------------
if (process.argv.includes("play")) {
  playAI();
} else {
  console.log("Starting self-play training. Press Ctrl+C to stop.");
  process.on("SIGINT", () => {
    save();
    process.exit(0);
  });
  
  // Start the loop (non‑blocking)
  trainStep();
}
async function playAI() {
  const game = new ChessGame();

  process.addListener("exit", () => {
    console.log("\nMoves played:", game.moves.join(" "));
  });
  let blind = false;

  const ans = await askQuestion("Play as [W]hite or [B]lack: ", (v) =>
    "wb ".includes(v.toLowerCase())
  );
  const side =
    ans.toLowerCase() === "w" ? 0 : ans.toLowerCase() === "b" ? 1 : 0;

  let illegal = false;
  while (game.status.outcome === null) {
    if (side === 1 - game.turn) {
      const moves = game.generateLegalMoves();
      const evals = moves
        .map((move) => {
          // console.log(move);
          return [
            (game.turn * 2 - 1) *
              net.forward(
                wrap(
                  (b) => (game.turn === 0 ? b : b.reverse()),
                  boardToInput(game.clone().playMove(move).board)
                )
              ),
            move,
          ];
        })
        .sort((a, b) => (game.turn === 0 ? b[0] - a[0] : a[0] - b[0]))
        .slice(0, 3); //top three moves
      console.log(evals)
      let chosenMove = randItem(
        evals.filter(
          (v, i) => i === 0 || (game.turn === 0 ? v[0] > 0 : v[0] < 0)
        ) //best moves that are not losing
      )[1];

      // console.log("Moves to play: " + game.generateLegalMoves().join(", "));
      console.log("\nComputer plays: " + chosenMove);
      game.playMove(chosenMove);
    }
    console.log();
    if (!blind) {
      console.log(game.asciiRender(2));
      console.log();
    }
    if (game.status.outcome !== null) {
      break;
    }
    const move = await askQuestion(
      `${illegal ? '"' + illegal + '" Illegal. ' : ""}${
        game.turn === 0 ? "White" : "Black"
      } to move: `
    );
    if (move.trim().toLowerCase() === "resign") {
      game.setStatus(1 - game.turn, "resignation");
      continue;
    }
    if (move === "b") {
      blind = !blind;
      continue;
    }
    if (game.isValidMove(move)) {
      game.playMove(move);
      illegal = false;
    } else {
      illegal = move;
    }
  }
  console.log(
    game.status.outcome === 0.5
      ? `Draw by ${game.status.reason}`
      : `${
          game.status.outcome
            ? side
              ? "You"
              : "Black"
            : side
            ? "You"
            : "White"
        } won by ${game.status.reason}`
  );
  console.log();
  console.log(game.asciiRender(side));
  console.log();
}
