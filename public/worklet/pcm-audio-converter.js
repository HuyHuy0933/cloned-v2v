class PCMAudioConverter extends AudioWorkletProcessor {
  constructor() {
    super();

    console.log("load pcm audio converter processor")
    this.bufferSize = 4096; // Desired buffer size
    this.buffer = new Float32Array(this.bufferSize); // Buffer to store audio data
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const inputChannelData = input[0];

      // Copy input data into the buffer
      for (let i = 0; i < inputChannelData.length; i++) {
        this.buffer[this.bufferIndex++] = inputChannelData[i];

        // When buffer is full, process the data
        if (this.bufferIndex === this.bufferSize) {
          // Convert Float32Array to Int16Array (similar to the previous approach)
          const int16Array = new Int16Array(this.buffer.length);
          for (let j = 0; j < this.buffer.length; j++) {
            int16Array[j] = Math.max(-1, Math.min(1, this.buffer[j])) * 0x7fff;
          }

          // Post the data to the main thread (for sending it via socket)
          this.port.postMessage(int16Array);

          // Reset buffer index
          this.bufferIndex = 0;
        }
      }
    }

    return true; // Keep the processor alive
  }
}

registerProcessor("pcm-audio-converter", PCMAudioConverter);
