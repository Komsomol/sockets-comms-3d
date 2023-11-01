// Desc: Client-side code for the web app. Establishes a WebSocket connection with the server and sends messages to the server when the user clicks on the buttons.
const ws = new WebSocket('ws://localhost:3001');
let rotationInterval;

ws.onopen = () => {
  console.log('Connected to WebSocket server on port 3001. ');
};

ws.onerror = (error) => {
  console.log(`WebSocket error: ${error}`);
}

ws.onclose = (event) => { 
  console.log('WebSocket connection closed');
}

window.sendModelChangeCommand = function(modelname) {
  console.log(`Changing model to ${modelname}`);
  ws.send(`${modelname}`);
}

window.startRotation = function(direction) {
  console.log(`Starting rotation ${direction}`);
  stopRotation(); // Clear any existing intervals
  rotationInterval = setInterval(() => {
    ws.send(`rotate-${direction}`);
  }, 50); // Adjust interval duration for smoother/faster rotations if needed
}

window.changeModel = (event) => {
  console.log(`Changing model`);
  ws.send(`change-model`);
}

window.stopRotation = function() {
  clearInterval(rotationInterval);
}
