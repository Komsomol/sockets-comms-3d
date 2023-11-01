// Desc: Client-side code for the web app. Establishes a WebSocket connection with the server and sends messages to the server when the user clicks on the buttons.
const ws = new WebSocket('ws://localhost:3001');
let rotationInterval;

ws.onopen = () => {
  console.log('Connected to WebSocket server on port 3001. ');
  console.log(ws.readyState);
  if (ws.readyState === WebSocket.OPEN) {
      ws.send('Connection established!');
      // document.getElementById('connected').innerText = '1';  // Indicates connected
      changeStatusText('Connected');
  }
};

ws.onerror = (error) => {
  console.log(`WebSocket error: ${error}`);
  changeStatusText('Error');
}

ws.onclose = (event) => { 
  console.log('WebSocket connection closed');
  changeStatusText('Disconnected');
}

let currentModel = 'London Financial District';
window.sendModelChangeCommand = function(modelname) {

  // check if new model is same as current model
  if (currentModel == modelname) {
    // if same, send message to server to change model
    console.log(`Model already loaded`)
  } else {
    console.log(`Changing model to ${modelname}`);
    ws.send(`${modelname}`);

    //save name of current model
    currentModel = modelname;
  }

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

window.changeStatusText = (status) => {
  document.getElementById('connected').innerText = status;
}