// Create an audio context
const audioContext = new window.AudioContext();

// Variables to store the recorded audio chunks
let recordedChunks: Blob[] = [];

// Create a media stream source from the user's microphone
navigator.mediaDevices
  .getUserMedia({ audio: true })
  .then((stream) => {
    // Create a media recorder instance
    const mediaRecorder = new MediaRecorder(stream);

    // Event handler for when a data chunk is available
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    // Event handler for when recording is stopped
    mediaRecorder.onstop = () => {
      // Convert the recorded chunks into a single Blob
      const recordedBlob = new Blob(recordedChunks, { type: "audio/webm" });

      // Reset the recorded chunks array
      recordedChunks = [];

      // Do something with the recorded audio blob, e.g., upload to a server
      // You can replace the console.log statement with your custom logic
      console.log(recordedBlob);
    };

    // Start recording when the user clicks a button or some other event
    const startRecording = () => {
      mediaRecorder.start();
    };

    // Stop recording when the user clicks a button or some other event
    const stopRecording = () => {
      mediaRecorder.stop();
    };

    // Example: Attach the start and stop recording functions to buttons
    const startButton = document.getElementById("startButton");
    const stopButton = document.getElementById("stopButton");
    startButton?.addEventListener("click", startRecording);
    stopButton?.addEventListener("click", stopRecording);
  })
  .catch((error) => {
    console.error("Error accessing microphone:", error);
  });
