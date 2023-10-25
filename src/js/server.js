const ws = new WebSocket('ws://localhost:3001');
let rotationInterval;

ws.onopen = () => {
  console.log('Connected to WebSocket server on port 3001. ');
};

window.startRotation = function(direction) {
  console.log(`Starting rotation ${direction}`);
  stopRotation(); // Clear any existing intervals
  rotationInterval = setInterval(() => {
    ws.send(`rotate-${direction}`);
  }, 50); // Adjust interval duration for smoother/faster rotations if needed
}

window.stopRotation = function() {
  clearInterval(rotationInterval);
}
