// AI helped me code this... 😉
class NeuralNetwork {
  constructor(layerSizes, learningRate = 0.01) {
    // layerSizes = [64, 64, 50, 25, 1]  (first is input size)
    this.layerSizes = layerSizes;
    this.lr = learningRate;
    this.numLayers = layerSizes.length - 1;
    this.weights = [];
    this.biases = [];
    this.activations = [];  // store output of each layer for backprop

    // Initialize weights and biases
    for (let i = 0; i < this.numLayers; i++) {
      const fanIn = layerSizes[i];
      const fanOut = layerSizes[i + 1];
      // He initialization for ReLU (except last layer which is linear)
      const std = Math.sqrt(2.0 / fanIn);
      const w = [];
      for (let j = 0; j < fanOut; j++) {
        const row = [];
        for (let k = 0; k < fanIn; k++) {
          row.push(gaussianRandom() * std);
        }
        w.push(row);
      }
      this.weights.push(w);
      this.biases.push(new Array(fanOut).fill(0));
    }
  }

  // ReLU activation
  relu(x) { return x > 0 ? x : 0; }
  reluDerivative(x) { return x > 0 ? 1 : 0; }

  // Forward pass
  forward(input) {
    let current = input;
    this.activations = [current];  // input as activation[0]

    for (let i = 0; i < this.numLayers; i++) {
      const W = this.weights[i];
      const b = this.biases[i];
      const next = new Array(this.layerSizes[i + 1]).fill(0);
      for (let j = 0; j < next.length; j++) {
        let sum = b[j];
        for (let k = 0; k < current.length; k++) {
          sum += W[j][k] * current[k];
        }
        // Hidden layers: ReLU, output layer: linear (no activation)
        if (i < this.numLayers - 1) {
          next[j] = this.relu(sum);
        } else {
          next[j] = sum;   // linear output (evaluation score)
        }
      }
      current = next;
      this.activations.push(current);
    }
    return current[0];  // scalar
  }

  // Backpropagation (single example, MSE loss)
  backward(input, target) {
    // Forward first to populate activations
    const output = this.forward(input);
    const error = target - output;   // derivative of MSE

    // Deltas for each layer (starting from output)
    const deltas = new Array(this.numLayers);
    for (let i = this.numLayers - 1; i >= 0; i--) {
      const layerOut = this.activations[i + 1];
      if (i === this.numLayers - 1) {
        // Output layer: linear activation -> derivative = 1
        deltas[i] = [error * 1];
      } else {
        // Hidden layer: ReLU derivative
        const W_next = this.weights[i + 1];
        const delta_next = deltas[i + 1];
        const delta = new Array(layerOut.length).fill(0);
        for (let j = 0; j < layerOut.length; j++) {
          let sum = 0;
          for (let k = 0; k < delta_next.length; k++) {
            sum += W_next[k][j] * delta_next[k]; // note: W_next[k][j] connects j to k
          }
          delta[j] = sum * this.reluDerivative(layerOut[j]);
        }
        deltas[i] = delta;
      }
    }

    // Update weights and biases
    for (let i = 0; i < this.numLayers; i++) {
      const W = this.weights[i];
      const b = this.biases[i];
      const input = this.activations[i];   // input to this layer
      const delta = deltas[i];
      for (let j = 0; j < W.length; j++) {
        for (let k = 0; k < W[j].length; k++) {
          W[j][k] += this.lr * delta[j] * input[k];
        }
        b[j] += this.lr * delta[j];
      }
    }
  }

  // Train on a batch of { input, target }
  trainBatch(batch) {
    for (const { input, target } of batch) {
      this.backward(input, target);
    }
  }

  // Serialize for saving
  toJSON() {
    return { weights: this.weights, biases: this.biases, layerSizes: this.layerSizes };
  }

  // Load from JSON
  static fromJSON(json, lr = 0.01) {
    const net = new NeuralNetwork(json.layerSizes, lr);
    net.weights = json.weights;
    net.biases = json.biases;
    return net;
  }
}


function gaussianRandom() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}


export {NeuralNetwork}