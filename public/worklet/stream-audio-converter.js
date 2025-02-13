class StreamAudioConverter extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.maxBufferSize = 1024; // Maximum buffer size to prevent lag
    console.log("Loaded StreamAudioConverter processor");

    this.port.onmessage = (event) => {
      const int16Array = new Int16Array(event.data);
      const float32Array = this.convertInt16ToFloat32(int16Array);
      this.addToBuffer(float32Array);
    };
  }

  // Converts Int16Array to Float32Array for Web Audio API compatibility
  convertInt16ToFloat32(int16Array) {
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768; // Normalize to -1 to 1 range
    }
    return float32Array;
  }

  // Adds new audio data to the buffer with size management
  addToBuffer(float32Array) {
    // Limit buffer size to maxBufferSize by removing old data if necessary
    const excessLength = (this.buffer.length + float32Array.length) - this.maxBufferSize;
    if (excessLength > 0) {
      this.buffer.splice(0, Math.round(excessLength / 2)); // Remove the oldest data
    }
    this.buffer.push(...float32Array);
  }

  process(inputs, outputs) {
    const output = outputs[0][0]; // Get the first output channel

    for (let i = 0; i < output.length; i++) {
      output[i] = this.buffer.length > 0 ? this.buffer.shift() : 0; // Smoothly output buffered audio
    }

    return true;
  }
}

registerProcessor("stream-audio-converter", StreamAudioConverter);
